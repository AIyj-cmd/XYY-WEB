#!/usr/bin/env python3
"""Generate source-traceable HTML reading data for image-only issues 1–5.

Uses cached PSM3 OCR only inside reviewed article regions.  It does not alter
the source PDFs or the shared 6–13 OCR pipeline.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

from early.early_extract import extract_paragraphs
from early.early_layout import FIGURES, ISSUE_METADATA, ISSUE_REGIONS


ROOT = Path(__file__).resolve().parents[2]
OCR_ROOT = ROOT / "output" / "whitepapers-ocr-layout"
DATA_ROOT = ROOT / "src" / "data" / "whitepapers"
IMAGE_ROOT = ROOT / "public" / "images" / "supply-chain-whitepapers"


def pdf_sha256(pdf: Path) -> str:
    with pdf.open("rb") as source_pdf:
        return hashlib.file_digest(source_pdf, "sha256").hexdigest()


def validate_issue_cache(issue: int, source_hash: str, ocr_root: Path = OCR_ROOT) -> None:
    """Fail closed if cached PSM3 evidence belongs to a different source PDF."""
    issue_dir = ocr_root / f"issue-{issue:02d}"
    manifest_path = issue_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("issue") != issue or manifest.get("sourceSha256") != source_hash:
        raise RuntimeError(f"issue {issue}: OCR cache manifest hash does not match source PDF")

    results = manifest.get("ocrResults")
    if not isinstance(results, list) or not results:
        raise RuntimeError(f"issue {issue}: OCR cache manifest has no OCR results")
    seen: set[tuple[int, str]] = set()
    for result in results:
        page, side = result.get("page"), result.get("side")
        identity = (page, side)
        if (
            result.get("issue") != issue
            or not isinstance(page, int)
            or page < 1
            or side != "full"
            or identity in seen
        ):
            raise RuntimeError(f"issue {issue}: OCR cache manifest region identity mismatch")
        seen.add(identity)
        lines_path = issue_dir / f"page-{page:03d}.lines.json"
        data = json.loads(lines_path.read_text(encoding="utf-8"))
        source_meta = data.get("source", {})
        if (
            source_meta.get("sha256") != source_hash
            or source_meta.get("physicalPage") != page
            or source_meta.get("side") != side
        ):
            raise RuntimeError(f"issue {issue}: {lines_path.name} source identity mismatch")


def source(issue: int, page: int, bbox: list[int] | None = None) -> dict:
    result: dict = {"pdfPage": page, "printedPage": None, "side": "full"}
    if bbox:
        result["bbox"] = bbox
    return result


def normalise_heading(value: str) -> str:
    return re.sub(r"[\s：:—－\-｜|，,。.!！?？\"“”‘’()（）]+", "", value)


def make_figure(issue: int, page: int, name: str, alt: str, box: tuple[int, int, int, int]) -> dict:
    source_image = OCR_ROOT / f"issue-{issue:02d}" / f"page-{page:03d}.png"
    target_dir = IMAGE_ROOT / str(issue)
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / name
    left, top, right, bottom = box
    width, height = right - left, bottom - top
    subprocess.run(
        [
            "convert",
            str(source_image),
            "-crop",
            f"{width}x{height}+{left}+{top}",
            "+repage",
            "-strip",
            "-quality",
            "88",
            str(target),
        ],
        check=True,
    )
    return {
        "type": "figure",
        "src": f"/images/supply-chain-whitepapers/{issue}/{name}",
        "alt": alt,
        "caption": alt,
        "width": width,
        "height": height,
        "source": source(issue, page, list(box)),
    }


def convert(issue: int) -> dict:
    metadata = ISSUE_METADATA[issue]
    pdf = ROOT / "public" / "senlinqikan" / "pdf" / f"{issue}.pdf"
    source_hash = pdf_sha256(pdf)
    validate_issue_cache(issue, source_hash)
    sections = []
    figure_by_page = {}
    for page, name, alt, box in FIGURES.get(issue, []):
        figure_by_page.setdefault(page, []).append((name, alt, box))

    emitted_figures: set[tuple[int, str]] = set()
    for region in ISSUE_REGIONS[issue]:
        lines_file = OCR_ROOT / f"issue-{issue:02d}" / f"page-{region.page:03d}.lines.json"
        blocks = []
        if region.subheading:
            blocks.append({"type": "subheading", "text": region.subheading, "source": source(issue, region.page)})
        paragraphs = (
            [(text, list(region.rect)) for text in region.verified_paragraphs]
            if region.verified_paragraphs
            else extract_paragraphs(lines_file, region.rect)
        )
        for text, bbox in paragraphs:
            # The region heading itself is emitted structurally as H2/H3.  OCR's
            # duplicate of that display title is not body prose and must not pad
            # the recovered-text count.
            if normalise_heading(text) in {
                normalise_heading(region.title),
                normalise_heading(region.subheading or ""),
            }:
                continue
            blocks.append({"type": "paragraph", "text": text, "source": source(issue, region.page, bbox)})
        for name, alt, box in figure_by_page.get(region.page, []):
            marker = (region.page, name)
            if marker not in emitted_figures:
                blocks.append(make_figure(issue, region.page, name, alt, box))
                emitted_figures.add(marker)
        if region.requires_review or not any(block["type"] == "paragraph" for block in blocks):
            # This note is intentionally tied to one unrecognisable source area;
            # it neither invents prose nor hides a whole issue behind a generic note.
            blocks.append({
                "type": "review-note",
                "text": f"原刊物理第{region.page}页“{region.title}”区域为低清图像排版；本阅读版仅保留可核对文字，未可靠恢复的正文请以 PDF 原版核对。",
                "source": source(issue, region.page, list(region.rect)),
            })
        sections.append({"title": region.title, "source": source(issue, region.page), "blocks": blocks})

    partial_notice = ""
    if issue in {3, 4, 5}:
        partial_notice = "本期目前为部分恢复稿，主要提供已核对的章节与少量可读原文，正文尚未完整转换；"
    return {
        "issue": str(issue),
        "originalTitle": metadata["originalTitle"],
        "title": metadata["title"],
        "description": metadata["description"],
        "sourcePdf": f"/senlinqikan/pdf/{issue}.pdf",
        "sourceSha256": source_hash,
        "sourcePublishedLabel": metadata["label"],
        "readingNotice": f"{partial_notice}本阅读版依据{metadata['originalTitle']}的图像原刊与已缓存 OCR 整理。原文中的时间、人物、活动和数据保留其历史语境，不构成新亦源当前服务承诺；低可信图文请回到 PDF 原版核对。",
        "sections": sections,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--issues", nargs="+", type=int, default=[1, 2, 3, 4, 5])
    args = parser.parse_args()
    for issue in args.issues:
        if issue not in ISSUE_METADATA:
            raise SystemExit(f"unsupported early issue: {issue}")
        destination = DATA_ROOT / f"{issue}.json"
        destination.write_text(json.dumps(convert(issue), ensure_ascii=False, indent=2) + "\n")
        print(destination.relative_to(ROOT))


if __name__ == "__main__":
    main()
