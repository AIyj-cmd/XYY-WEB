#!/usr/bin/env python3
"""Create the bounded high-density figure assets used by whitepaper readers.

This is intentionally a small, source-locked derivation step.  It renders only
the figures declared below; it never reflows an article, reads OCR text, or
replaces a PDF or its first-generation crop.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Literal


ROOT = Path(__file__).resolve().parents[2]
PDF_ROOT = ROOT / "public/senlinqikan/pdf"
DATA_ROOT = ROOT / "src/data/whitepapers"
PUBLIC_ROOT = ROOT / "public"
MANIFEST_PATH = ROOT / "src/data/whitepaper-figure-assets.json"
RENDER_DPI = 288
PIXELS_PER_POINT = RENDER_DPI / 72


@dataclass(frozen=True)
class AssetSpec:
    issue: str
    filename: str
    quality: Literal["enhanced", "source-limited"]
    kind: Literal["diagram", "photo"]
    display_width: int
    embedded_image: int | None = None

    @property
    def original_src(self) -> str:
        return f"/images/supply-chain-whitepapers/{self.issue}/{self.filename}.png"

    @property
    def reading_src(self) -> str:
        return f"/images/supply-chain-whitepapers/{self.issue}/reading/{self.filename}.webp"


# The selected list is deliberately explicit.  The issue-14 source crops are
# owned by convert_issue.py's FIGURES list; matching by src then verifies the
# stored figure bbox before any output is made.  p4's three JPEG charts stay
# at their native detail rather than being enlarged by a new page render.
SPECS = (
    *(AssetSpec("14", name, "source-limited", "diagram", width, embedded)
      for name, width, embedded in (
          ("textile-export-bar-chart", 318, 0),
          ("textile-export-share-chart", 316, 7),
          ("textile-export-trend-chart", 315, 3),
      )),
    *(AssetSpec("14", name, "enhanced", "diagram", width)
      for name, width in (
          ("product-growth-core-insights", 768),
          ("product-growth-value-insights", 768),
          ("product-growth-trends", 768),
          ("product-growth-feedback", 768),
          ("product-growth-decision-map", 768),
          ("product-growth-growth-loop", 768),
          ("cross-border-challenges", 768),
          ("cross-border-network", 768),
          ("cross-border-fulfillment", 768),
          ("cross-border-reverse-logistics", 768),
          ("cross-border-order-system", 768),
          ("cross-border-cases", 768),
          ("cross-border-reasons", 768),
          ("cross-border-outlook", 768),
          ("shanghai-traditional-challenges", 768),
          ("shanghai-cloud-warehouse-model", 768),
          ("shanghai-specialist-capability", 476),
          ("shanghai-service-scenes", 768),
          ("shanghai-customer-witness", 768),
          ("rising-star-roster", 768),
          ("awards-efficiency", 768),
          ("awards-employee", 768),
          ("awards-quality", 768),
          ("awards-6s", 768),
          ("awards-service", 570),
          ("awards-stability", 570),
          ("awards-management", 380),
      )),
    AssetSpec("12", "quality-defect-table", "enhanced", "diagram", 698),
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require_expected_sha(path: Path, expected: str) -> None:
    if sha256(path) != expected:
        raise ValueError(f"Source SHA mismatch: {path}")


def run(command: list[str]) -> None:
    completed = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if completed.returncode:
        raise RuntimeError(
            f"Command failed ({' '.join(command)}):\n{completed.stdout}{completed.stderr}"
        )


def image_dimensions(path: Path) -> tuple[int, int]:
    completed = subprocess.run(
        ["identify", "-format", "%w %h", str(path)],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    width, height = completed.stdout.split()
    return int(width), int(height)


def pdf_bounds(pdf: Path) -> tuple[int, float, float]:
    completed = subprocess.run(["pdfinfo", str(pdf)], cwd=ROOT, text=True, capture_output=True, check=True)
    pages_match = re.search(r"^Pages:\s+(\d+)$", completed.stdout, re.MULTILINE)
    size_match = re.search(r"^Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts", completed.stdout, re.MULTILINE)
    if not pages_match or not size_match:
        raise ValueError(f"pdfinfo did not report page bounds: {pdf}")
    return int(pages_match.group(1)), float(size_match.group(1)), float(size_match.group(2))


def validate_bbox(bbox: list[float], page_width: float, page_height: float) -> None:
    left, top, right, bottom = bbox
    if not (0 <= left < right <= page_width and 0 <= top < bottom <= page_height):
        raise ValueError(f"Source bbox is outside the PDF page: {bbox}")


def load_figures(issue: str) -> tuple[dict, dict[str, dict]]:
    payload = json.loads((DATA_ROOT / f"{issue}.json").read_text(encoding="utf-8"))
    pdf = PDF_ROOT / f"{issue}.pdf"
    try:
        require_expected_sha(pdf, payload["sourceSha256"])
    except ValueError as error:
        raise ValueError(f"Source SHA mismatch for issue {issue}: {pdf}") from error
    figures: dict[str, dict] = {}
    for section in payload["sections"]:
        for block in section["blocks"]:
            if block.get("type") == "figure":
                figures[block["src"]] = block
    pages, page_width, page_height = pdf_bounds(pdf)
    for figure in figures.values():
        source = figure.get("source", {})
        bbox = source.get("bbox")
        if bbox is not None:
            if not 1 <= source.get("pdfPage", 0) <= pages:
                raise ValueError(f"Figure source page is outside the PDF: {figure['src']}")
            validate_bbox(bbox, page_width, page_height)
    return payload, figures


def expected_crop_size(bbox: list[float]) -> tuple[int, int]:
    return (
        round((bbox[2] - bbox[0]) * PIXELS_PER_POINT),
        round((bbox[3] - bbox[1]) * PIXELS_PER_POINT),
    )


def validate_plan() -> dict[AssetSpec, dict]:
    selected: dict[AssetSpec, dict] = {}
    by_issue: dict[str, tuple[dict, dict[str, dict]]] = {}
    for spec in SPECS:
        if spec.issue not in by_issue:
            by_issue[spec.issue] = load_figures(spec.issue)
        _payload, figures = by_issue[spec.issue]
        figure = figures.get(spec.original_src)
        if figure is None:
            raise ValueError(f"Missing declared figure in issue JSON: {spec.original_src}")
        bbox = figure.get("source", {}).get("bbox")
        if not isinstance(bbox, list) or len(bbox) != 4:
            raise ValueError(f"Missing bounded source bbox: {spec.original_src}")
        source_path = PUBLIC_ROOT / figure["src"].lstrip("/")
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing first-generation crop: {source_path}")
        selected[spec] = figure
    return selected


def render_page(pdf: Path, page: int, destination: Path) -> None:
    run([
        "pdftoppm", "-f", str(page), "-l", str(page), "-r", str(RENDER_DPI),
        "-png", "-singlefile", str(pdf), str(destination),
    ])


def crop_rendered_page(page_png: Path, bbox: list[float], destination: Path) -> None:
    x = round(bbox[0] * PIXELS_PER_POINT)
    y = round(bbox[1] * PIXELS_PER_POINT)
    width, height = expected_crop_size(bbox)
    run([
        "convert", str(page_png), "-crop", f"{width}x{height}+{x}+{y}", "+repage",
        "-define", "webp:lossless=true", str(destination),
    ])
    if image_dimensions(destination) != (width, height):
        raise ValueError(f"Rendered crop dimensions are not exact for {destination}")


def extract_native_jpegs(pdf: Path, page: int, destination: Path) -> None:
    run(["pdfimages", "-f", str(page), "-l", str(page), "-j", str(pdf), str(destination / "image")])


def convert_native_jpeg(source: Path, destination: Path) -> None:
    run(["convert", str(source), "-define", "webp:lossless=true", str(destination)])


def generate(plan: dict[AssetSpec, dict]) -> dict[str, dict]:
    manifest: dict[str, dict] = {}
    enhanced_by_page: dict[tuple[str, int], list[tuple[AssetSpec, dict]]] = defaultdict(list)
    limited_by_page: dict[tuple[str, int], list[tuple[AssetSpec, dict]]] = defaultdict(list)
    for spec, figure in plan.items():
        page = figure["source"]["pdfPage"]
        (enhanced_by_page if spec.quality == "enhanced" else limited_by_page)[(spec.issue, page)].append((spec, figure))

    with tempfile.TemporaryDirectory(prefix="xyy-reading-images-") as temp_dir:
        temp = Path(temp_dir)
        for (issue, page), entries in enhanced_by_page.items():
            # pdftoppm appends .png itself when given the -png output prefix.
            page_prefix = temp / f"issue-{issue}-page-{page}"
            page_png = page_prefix.with_suffix(".png")
            render_page(PDF_ROOT / f"{issue}.pdf", page, page_prefix)
            for spec, figure in entries:
                destination = PUBLIC_ROOT / spec.reading_src.lstrip("/")
                destination.parent.mkdir(parents=True, exist_ok=True)
                bbox = figure["source"]["bbox"]
                crop_rendered_page(page_png, bbox, destination)
                width, height = image_dimensions(destination)
                manifest[spec.original_src] = {
                    "src": spec.reading_src,
                    "width": width,
                    "height": height,
                    "displayWidth": spec.display_width,
                    "quality": spec.quality,
                    "kind": spec.kind,
                }
        for (issue, page), entries in limited_by_page.items():
            embedded = temp / f"issue-{issue}-page-{page}-embedded"
            embedded.mkdir()
            extract_native_jpegs(PDF_ROOT / f"{issue}.pdf", page, embedded)
            for spec, _figure in entries:
                assert spec.embedded_image is not None
                source = embedded / f"image-{spec.embedded_image:03d}.jpg"
                if not source.is_file():
                    raise FileNotFoundError(f"Expected embedded JPEG is absent: {source}")
                destination = PUBLIC_ROOT / spec.reading_src.lstrip("/")
                destination.parent.mkdir(parents=True, exist_ok=True)
                convert_native_jpeg(source, destination)
                width, height = image_dimensions(destination)
                if width != spec.display_width:
                    raise ValueError(f"Native image width changed unexpectedly: {destination}")
                manifest[spec.original_src] = {
                    "src": spec.reading_src,
                    "width": width,
                    "height": height,
                    "displayWidth": spec.display_width,
                    "quality": spec.quality,
                    "kind": spec.kind,
                }
    return dict(sorted(manifest.items()))


def check_manifest(plan: dict[AssetSpec, dict], manifest: dict[str, dict]) -> None:
    expected_sources = {spec.original_src for spec in plan}
    if set(manifest) != expected_sources:
        raise ValueError("Manifest sources do not exactly match the declared derivation plan")
    for spec, figure in plan.items():
        item = manifest[spec.original_src]
        expected = {"src", "width", "height", "displayWidth", "quality", "kind"}
        if set(item) != expected:
            raise ValueError(f"Unexpected manifest fields for {spec.original_src}")
        destination = PUBLIC_ROOT / item["src"].lstrip("/")
        if not destination.is_file():
            raise FileNotFoundError(f"Missing generated reading asset: {destination}")
        if image_dimensions(destination) != (item["width"], item["height"]):
            raise ValueError(f"Manifest dimensions do not match file: {destination}")
        if item["displayWidth"] > 768 or item["displayWidth"] <= 0:
            raise ValueError(f"Invalid display width: {spec.original_src}")
        if item["quality"] != spec.quality or item["kind"] != spec.kind:
            raise ValueError(f"Manifest classification changed: {spec.original_src}")
        if spec.quality == "enhanced":
            expected_size = expected_crop_size(figure["source"]["bbox"])
            if (item["width"], item["height"]) != expected_size:
                raise ValueError(f"Enhanced source bbox is not rendered at {RENDER_DPI}dpi: {spec.original_src}")
        elif item["width"] != spec.display_width:
            raise ValueError(f"Source-limited image exceeds its native display cap: {spec.original_src}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Validate sources, manifest and generated files without writing.")
    args = parser.parse_args()
    plan = validate_plan()
    if args.check:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        check_manifest(plan, manifest)
        print(f"Validated {len(manifest)} source-locked reading image assets")
        return
    manifest = generate(plan)
    check_manifest(plan, manifest)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(manifest)} source-locked reading image assets")


if __name__ == "__main__":
    main()
