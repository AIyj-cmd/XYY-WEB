"""Line-level, region-aware extraction helpers for native whitepaper HTML."""

from __future__ import annotations

from dataclasses import dataclass
import re

import pymupdf


@dataclass
class Line:
    text: str
    bbox: tuple[float, float, float, float]
    size: float
    color: int


def clean_text(text: str) -> str:
    """Remove PDF glyph spacing without changing deliberate Latin-word spaces."""
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
    text = re.sub(r"(?<=\d)\s+(?=\d)", "", text)
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\dA-Za-z])", "", text)
    text = re.sub(r"(?<=[\dA-Za-z])\s+(?=[\u4e00-\u9fff])", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _overlaps(area: tuple[float, float, float, float], bbox: tuple[float, float, float, float]) -> bool:
    ax0, ay0, ax1, ay1 = area
    bx0, by0, bx1, by1 = bbox
    return max(ax0, bx0) < min(ax1, bx1) and max(ay0, by0) < min(ay1, by1)


def lines_in_region(page: pymupdf.Page, bbox: tuple[float, float, float, float], excluded: list[tuple[float, float, float, float]]) -> list[Line]:
    """Return source-order lines from exactly one audited visual region."""
    lines: list[Line] = []
    for block in page.get_text("dict", clip=pymupdf.Rect(*bbox))["blocks"]:
        if block.get("type") != 0:
            continue
        for raw_line in block["lines"]:
            line_bbox = tuple(float(value) for value in raw_line["bbox"])
            if any(_overlaps(area, line_bbox) for area in excluded):
                continue
            spans = raw_line["spans"]
            text = clean_text("".join(span["text"] for span in spans))
            if not text:
                continue
            lines.append(
                Line(
                    text=text,
                    bbox=line_bbox,
                    size=max(float(span["size"]) for span in spans),
                    color=spans[0].get("color", 0),
                )
            )
    # get_text(dict) generally follows visual order, but y/x makes this stable
    # within a manifest region without using PDF object insertion order.
    return sorted(lines, key=lambda line: (round(line.bbox[1], 1), line.bbox[0]))


def is_subheading(line: Line) -> bool:
    """Use visual typography, never lexical guesses such as a leading number."""
    text = line.text
    if len(text) > 72:
        return False
    if line.size >= 13.0:
        return True
    # The magazine uses blue 12pt subheads. Body text is black 11pt; retain
    # all Chinese numeral headings but do not promote ordinary short sentences.
    return line.size >= 11.8 and line.color not in {0, 16777215} and ("、" in text or "：" in text or len(text) <= 28)


def paragraphs_from_lines(lines: list[Line], region_x0: float) -> list[dict]:
    """Join wrapped lines into semantic paragraphs and retain first-line source."""
    blocks: list[dict] = []
    current: list[Line] = []

    def flush() -> None:
        nonlocal current
        if not current:
            return
        text = clean_text("".join(line.text for line in current))
        if text:
            x0 = min(line.bbox[0] for line in current)
            y0 = min(line.bbox[1] for line in current)
            x1 = max(line.bbox[2] for line in current)
            y1 = max(line.bbox[3] for line in current)
            blocks.append({"type": "paragraph", "text": text, "bbox": [x0, y0, x1, y1]})
        current = []

    previous: Line | None = None
    for line in lines:
        if is_subheading(line):
            flush()
            blocks.append({"type": "subheading", "text": line.text, "bbox": list(line.bbox)})
            previous = line
            continue
        if previous:
            baseline_gap = line.bbox[1] - previous.bbox[1]
            is_indented = line.bbox[0] - region_x0 > 14
            # A new indent after a complete visual line or a visibly larger
            # paragraph gap starts a new <p>. Wrapped lines remain together.
            starts_new = baseline_gap > max(previous.size * 1.55, 19) or (
                is_indented and baseline_gap > previous.size * 1.05 and bool(current)
            )
            if starts_new:
                flush()
        current.append(line)
        previous = line
    flush()
    return blocks


def can_continue(left: dict, right: dict) -> bool:
    if left["type"] != "paragraph" or right["type"] != "paragraph":
        return False
    return not left["text"].rstrip().endswith(("。", "！", "？", "…", "；", "："))
