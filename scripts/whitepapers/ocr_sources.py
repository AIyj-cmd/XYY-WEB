#!/usr/bin/env python3
"""Local, resumable OCR evidence extractor for whitepapers 1-13.

This tool is deliberately not a HTML converter.  It only writes ignored local
OCR evidence under ``output/whitepapers-ocr``: source hashes, per-region PNGs,
raw Tesseract TSV, and lossless word/line coordinates.  Horizontal magazines
are split into left and right source halves before OCR so column order is not
silently mixed across a spread.

Examples:
  /tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python \
    scripts/whitepapers/ocr_sources.py --issues 1,2 --workers 4
  /tmp/xyy-whitepapers-tools.WpZbp4/venv/bin/python \
    scripts/whitepapers/ocr_sources.py --issues all --workers 4
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import pymupdf


ROOT = Path(__file__).resolve().parents[2]
PDF_ROOT = ROOT / "public/senlinqikan/pdf"
DEFAULT_OUTPUT = ROOT / "output/whitepapers-ocr"
AUDIT_CATALOG = ROOT / "scripts/whitepapers/ocr/catalog.issues-1-13.json"
OCR_VERSION = 1
LANDSCAPE_ISSUES = {6, 7, 8, 9, 11, 12, 13}
VERTICAL_HEADER_ONLY_ISSUES = {1, 2, 3, 4, 5, 10}
LOW_CONFIDENCE = 50.0


@dataclass(frozen=True)
class RegionSpec:
    issue: int
    page: int
    side: str
    source_hash: str
    source_path: str
    page_width: float
    page_height: float
    clip: tuple[float, float, float, float]
    native_text_chars: int
    native_classification: str
    output_dir: str
    dpi: int
    psm: int

    @property
    def stem(self) -> str:
        side = "" if self.side == "full" else f"-{self.side}"
        return f"page-{self.page:03d}{side}"


def sha256(path: Path) -> str:
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def parse_issues(value: str) -> list[int]:
    if value.strip().lower() == "all":
        return list(range(1, 14))
    try:
        issues = sorted({int(part.strip()) for part in value.split(",") if part.strip()})
    except ValueError as exc:
        raise argparse.ArgumentTypeError("--issues must be `all` or comma-separated integers") from exc
    if not issues or any(issue < 1 or issue > 13 for issue in issues):
        raise argparse.ArgumentTypeError("--issues accepts only 1 through 13")
    return issues


def parse_page_filter(value: str) -> set[int]:
    try:
        pages = {int(part.strip()) for part in value.split(",") if part.strip()}
    except ValueError as exc:
        raise argparse.ArgumentTypeError("--pages must be comma-separated positive integers") from exc
    if not pages or any(page < 1 for page in pages):
        raise argparse.ArgumentTypeError("--pages must contain positive integers")
    return pages


def audited_source_hashes() -> dict[int, str]:
    catalog = json.loads(AUDIT_CATALOG.read_text(encoding="utf-8"))
    return {entry["issue"]: entry["source"]["sha256"] for entry in catalog["issues"]}


def native_classification(issue: int, chars: int, source_hash_matches_audit: bool) -> str:
    if not source_hash_matches_audit:
        return "manual-review-required; source-hash-changed; OCR-not-run"
    if issue in LANDSCAPE_ISSUES and chars == 0:
        return "no-native-text-layer"
    if issue in VERTICAL_HEADER_ONLY_ISSUES and chars <= 300:
        return "header-url-page-number-only; body-unreliable"
    return "manual-review-required; OCR-not-run"


def extract_lines(tsv: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Keep the raw OCR words, plus reproducible line grouping and confidence."""
    # Do not use str.splitlines(): OCR can emit Unicode line-separator-like
    # glyphs in the text column, which would turn one TSV row into fake data.
    rows = list(csv.DictReader(io.StringIO(tsv, newline=""), delimiter="\t", quoting=csv.QUOTE_NONE))
    words: list[dict[str, Any]] = []
    grouped: dict[tuple[str, ...], list[dict[str, Any]]] = {}
    for row in rows:
        text = (row.get("text") or "").strip()
        if not text or row.get("level") != "5":
            continue
        try:
            word = {
                "text": text,
                "bbox": [int(row["left"]), int(row["top"]), int(row["width"]), int(row["height"])],
                "confidence": float(row["conf"]),
                "block": int(row["block_num"]),
                "paragraph": int(row["par_num"]),
                "line": int(row["line_num"]),
                "word": int(row["word_num"]),
            }
        except (KeyError, ValueError) as exc:
            raise ValueError(f"unparseable Tesseract TSV row: {row!r}") from exc
        word["index"] = len(words)
        words.append(word)
        key = (str(word["block"]), str(word["paragraph"]), str(word["line"]))
        grouped.setdefault(key, []).append(word)

    lines: list[dict[str, Any]] = []
    for grouped_words in grouped.values():
        grouped_words.sort(key=lambda item: item["word"])
        x0 = min(item["bbox"][0] for item in grouped_words)
        y0 = min(item["bbox"][1] for item in grouped_words)
        x1 = max(item["bbox"][0] + item["bbox"][2] for item in grouped_words)
        y1 = max(item["bbox"][1] + item["bbox"][3] for item in grouped_words)
        lines.append(
            {
                "text": " ".join(item["text"] for item in grouped_words),
                "bbox": [x0, y0, x1 - x0, y1 - y0],
                "meanConfidence": round(sum(item["confidence"] for item in grouped_words) / len(grouped_words), 2),
                "wordIndexes": [item["index"] for item in grouped_words],
            }
        )
    lines.sort(key=lambda item: (item["bbox"][1], item["bbox"][0]))
    for word in words:
        word.pop("index")
    return words, lines


def cache_is_current(spec: RegionSpec) -> bool:
    base = Path(spec.output_dir) / f"issue-{spec.issue:02d}" / spec.stem
    data_path = base.with_suffix(".lines.json")
    if not all(path.exists() for path in (base.with_suffix(".png"), base.with_suffix(".tsv"), data_path)):
        return False
    try:
        data = json.loads(data_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    return (
        data.get("ocrVersion") == OCR_VERSION
        and data.get("source", {}).get("sha256") == spec.source_hash
        and data.get("render", {}).get("dpi") == spec.dpi
        and data.get("ocr", {}).get("psm") == spec.psm
    )


def ocr_region(spec: RegionSpec, force: bool) -> dict[str, Any]:
    if not force and cache_is_current(spec):
        return {"issue": spec.issue, "page": spec.page, "side": spec.side, "status": "cached"}

    output = Path(spec.output_dir) / f"issue-{spec.issue:02d}"
    output.mkdir(parents=True, exist_ok=True)
    base = output / spec.stem
    png_path = base.with_suffix(".png")
    tsv_path = base.with_suffix(".tsv")
    lines_path = base.with_suffix(".lines.json")
    document = pymupdf.open(spec.source_path)
    try:
        page = document[spec.page - 1]
        pixmap = page.get_pixmap(
            clip=pymupdf.Rect(*spec.clip),
            matrix=pymupdf.Matrix(spec.dpi / 72, spec.dpi / 72),
            alpha=False,
        )
        pixmap.save(png_path)
    finally:
        document.close()

    environment = {**os.environ, "OMP_THREAD_LIMIT": "1"}
    completed = subprocess.run(
        ["/usr/bin/tesseract", str(png_path), "stdout", "-l", "chi_sim+eng", "--psm", str(spec.psm), "tsv"],
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=environment,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"tesseract failed for issue {spec.issue} {spec.stem}: {completed.stderr.strip()}")
    tsv_path.write_text(completed.stdout, encoding="utf-8")
    words, lines = extract_lines(completed.stdout)
    low = [word for word in words if word["confidence"] < LOW_CONFIDENCE]
    anomalies: list[dict[str, Any]] = []
    if spec.native_classification.startswith("header-url"):
        anomalies.append(
            {
                "kind": "native-header-footer-only",
                "detail": "Native text is retained as source evidence but is not usable body text; OCR covers the image body.",
            }
        )
    if not words:
        anomalies.append({"kind": "no-ocr-words", "detail": "Tesseract produced no word-level OCR output."})
    if low:
        anomalies.append(
            {
                "kind": "low-confidence-words",
                "threshold": LOW_CONFIDENCE,
                "count": len(low),
                "samples": [
                    {"text": word["text"], "bbox": word["bbox"], "confidence": word["confidence"]}
                    for word in low[:20]
                ],
            }
        )
    payload = {
        "ocrVersion": OCR_VERSION,
        "source": {
            "pdf": f"/senlinqikan/pdf/{spec.issue}.pdf",
            "sha256": spec.source_hash,
            "physicalPage": spec.page,
            "side": spec.side,
            "pdfRect": [round(value, 2) for value in spec.clip],
            "nativeTextCharacters": spec.native_text_chars,
            "nativeTextClassification": spec.native_classification,
        },
        "render": {"dpi": spec.dpi, "image": png_path.name},
        "ocr": {"engine": "tesseract", "language": "chi_sim+eng", "psm": spec.psm, "tsv": tsv_path.name},
        "words": words,
        "lines": lines,
        "anomalies": anomalies,
    }
    lines_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"issue": spec.issue, "page": spec.page, "side": spec.side, "status": "created", "words": len(words), "low": len(low)}


def reparse_cached_outputs(output: Path, issues: list[int]) -> int:
    """Refresh line/word JSON from existing TSV without rendering or OCR again."""
    refreshed = 0
    for issue in issues:
        for tsv_path in sorted((output / f"issue-{issue:02d}").glob("*.tsv")):
            lines_path = tsv_path.with_suffix(".lines.json")
            if not lines_path.exists():
                raise RuntimeError(f"cannot reparse without existing JSON metadata: {lines_path}")
            data = json.loads(lines_path.read_text(encoding="utf-8"))
            words, lines = extract_lines(tsv_path.read_text(encoding="utf-8"))
            anomalies = [
                item
                for item in data.get("anomalies", [])
                if item.get("kind") not in {"low-confidence-words", "no-ocr-words"}
            ]
            low = [word for word in words if word["confidence"] < LOW_CONFIDENCE]
            if not words:
                anomalies.append({"kind": "no-ocr-words", "detail": "Tesseract produced no word-level OCR output."})
            if low:
                anomalies.append(
                    {
                        "kind": "low-confidence-words",
                        "threshold": LOW_CONFIDENCE,
                        "count": len(low),
                        "samples": [
                            {"text": word["text"], "bbox": word["bbox"], "confidence": word["confidence"]}
                            for word in low[:20]
                        ],
                    }
                )
            data["words"] = words
            data["lines"] = lines
            data["anomalies"] = anomalies
            data.setdefault("ocr", {})["tsvParser"] = "quote-none"
            lines_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            refreshed += 1
    print(f"Reparsed {refreshed} cached OCR TSV files under {output.relative_to(ROOT)}")
    return 0


def issue_specs(
    issue: int,
    source_hash: str,
    output_dir: Path,
    dpi: int,
    psm: int,
    pages: set[int] | None,
    sides: set[str] | None,
) -> tuple[list[RegionSpec], dict[str, Any]]:
    source = PDF_ROOT / f"{issue}.pdf"
    expected_hash = audited_source_hashes().get(issue)
    source_hash_matches_audit = source_hash == expected_hash
    document = pymupdf.open(source)
    specs: list[RegionSpec] = []
    page_evidence: list[dict[str, Any]] = []
    try:
        for page_index, page in enumerate(document, start=1):
            if pages is not None and page_index not in pages:
                continue
            rect = page.rect
            chars = len(page.get_text("text").strip())
            classification = native_classification(issue, chars, source_hash_matches_audit)
            page_evidence.append(
                {
                    "physicalPage": page_index,
                    "nativeTextCharacters": chars,
                    "nativeTextClassification": classification,
                }
            )
            if classification.endswith("OCR-not-run"):
                continue
            region_sides = (("full", (rect.x0, rect.y0, rect.x1, rect.y1)),)
            if issue in LANDSCAPE_ISSUES:
                middle = rect.x0 + rect.width / 2
                region_sides = (("left", (rect.x0, rect.y0, middle, rect.y1)), ("right", (middle, rect.y0, rect.x1, rect.y1)))
            for side, clip in region_sides:
                if sides is not None and side not in sides:
                    continue
                specs.append(
                    RegionSpec(
                        issue=issue,
                        page=page_index,
                        side=side,
                        source_hash=source_hash,
                        source_path=str(source),
                        page_width=rect.width,
                        page_height=rect.height,
                        clip=clip,
                        native_text_chars=chars,
                        native_classification=classification,
                        output_dir=str(output_dir),
                        dpi=dpi,
                        psm=psm,
                    )
                )
    finally:
        document.close()
    return specs, {
        "issue": issue,
        "sourcePdf": f"/senlinqikan/pdf/{issue}.pdf",
        "sourceSha256": source_hash,
        "sourceAudit": {"catalog": str(AUDIT_CATALOG.relative_to(ROOT)), "expectedSha256": expected_hash, "matchesAuditedSource": source_hash_matches_audit},
        "layout": "landscape-spreads-split-left-right" if issue in LANDSCAPE_ISSUES else "portrait-full-page",
        "ocrRegions": len(specs),
        "pageNativeEvidence": page_evidence,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--issues", required=True, type=parse_issues, help="all or e.g. 1,2,6")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--dpi", type=int, default=200)
    parser.add_argument("--psm", type=int, default=11)
    parser.add_argument("--pages", type=parse_page_filter, help="optional physical PDF pages, e.g. 3 or 2,3")
    parser.add_argument("--sides", choices=("left", "right", "full"), nargs="+", help="optional source side filter")
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--force", action="store_true", help="ignore matching per-region cache")
    parser.add_argument("--reparse-cache", action="store_true", help="rebuild JSON from existing TSV only; do not render or OCR")
    args = parser.parse_args()
    if args.dpi < 150 or args.dpi > 300:
        parser.error("--dpi must be between 150 and 300")
    if args.workers < 1 or args.workers > 6:
        parser.error("--workers must be between 1 and 6")

    args.output = args.output.resolve()
    args.output.mkdir(parents=True, exist_ok=True)
    if args.reparse_cache:
        return reparse_cached_outputs(args.output, args.issues)
    all_specs: list[RegionSpec] = []
    manifests: list[dict[str, Any]] = []
    for issue in args.issues:
        source = PDF_ROOT / f"{issue}.pdf"
        if not source.exists():
            raise SystemExit(f"missing source PDF: {source}")
        specs, manifest = issue_specs(
            issue,
            sha256(source),
            args.output,
            args.dpi,
            args.psm,
            args.pages,
            set(args.sides) if args.sides else None,
        )
        all_specs.extend(specs)
        manifests.append(manifest)

    print(f"Prepared {len(all_specs)} OCR regions for issues {','.join(str(issue) for issue in args.issues)}; workers={args.workers}, dpi={args.dpi}")
    results: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [pool.submit(ocr_region, spec, args.force) for spec in all_specs]
        for future in as_completed(futures):
            result = future.result()
            results.append(result)
            print(f"{result['status']}: issue {result['issue']} page {result['page']} {result['side']}" + (f" ({result.get('words', 0)} words)" if "words" in result else ""))

    by_issue = {issue: [] for issue in args.issues}
    for result in results:
        by_issue[result["issue"]].append(result)
    for manifest in manifests:
        issue_results = sorted(by_issue[manifest["issue"]], key=lambda item: (item["page"], item["side"]))
        manifest["ocrResults"] = issue_results
        manifest["ocrVersion"] = OCR_VERSION
        manifest["warning"] = "OCR output is evidence, not publishable prose. Review low-confidence and layout-sensitive regions against the source PDF."
        path = args.output / f"issue-{manifest['issue']:02d}" / "manifest.json"
        path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote OCR evidence under {args.output.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
