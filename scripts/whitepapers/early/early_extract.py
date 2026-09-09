"""Line-level OCR extraction for the audited early-issue reading regions."""

from __future__ import annotations

import json
import re
from pathlib import Path


HEADER_RE = re.compile(r"(?:https?://|mp\.weixin|第\s*\d+\s*页|共\s*\d+\s*页|2026/7/7)", re.I)
CHINESE_RE = re.compile(r"[\u3400-\u9fff]")
SPACE_RE = re.compile(r"\s+")


def clean_text(value: str) -> str:
    """Remove OCR spacing inside Chinese prose without rewriting its wording."""
    value = SPACE_RE.sub(" ", value).strip()
    value = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[\u3400-\u9fff])", "", value)
    value = re.sub(r"(?<=[\u3400-\u9fff])\s+(?=[，。！？；：、”’）】])", "", value)
    value = re.sub(r"(?<=[（【“‘])\s+(?=[\u3400-\u9fff])", "", value)
    value = re.sub(r"\s+([，。！？；：、）】])", r"\1", value)
    return value.strip(" -|_")


def in_rect(box: list[int], rect: tuple[int, int, int, int]) -> bool:
    x, y, width, height = box
    left, top, right, bottom = rect
    center_x, center_y = x + width / 2, y + height / 2
    return left <= center_x <= right and top <= center_y <= bottom


def credible(line: dict) -> bool:
    text = clean_text(line["text"])
    chinese = len(CHINESE_RE.findall(text))
    if HEADER_RE.search(text) or chinese < 6 or line.get("meanConfidence", 0) < 80:
        return False
    # Page decoration and OCR garbage are predominantly Latin punctuation.  Do not
    # turn them into publishing prose merely because they happen to sit in a body box.
    alpha_noise = len(re.findall(r"[A-Za-z]", text))
    if alpha_noise > max(3, chinese // 4):
        return False
    return not re.search(r"(?:QO|[=|_]{2,}|\bPAR\b|\ba\s*二)", text, re.I)


def extract_paragraphs(lines_path: Path, rect: tuple[int, int, int, int]) -> list[tuple[str, list[int]]]:
    payload = json.loads(lines_path.read_text())
    candidates = [line for line in payload["lines"] if in_rect(line["bbox"], rect) and credible(line)]
    candidates.sort(key=lambda line: (line["bbox"][1], line["bbox"][0]))

    paragraphs: list[tuple[str, list[int]]] = []
    current: list[dict] = []
    for line in candidates:
        if current:
            previous = current[-1]
            gap = line["bbox"][1] - (previous["bbox"][1] + previous["bbox"][3])
            # Adjacent OCR lines in a shared column form one paragraph; a larger gap
            # is a source paragraph transition.  This deliberately never joins all
            # lines in a region into a single synthetic block.
            if gap > 38 or abs(line["bbox"][0] - previous["bbox"][0]) > 110:
                paragraphs.append(_finish(current))
                current = []
        current.append(line)
    if current:
        paragraphs.append(_finish(current))
    return [(text, box) for text, box in paragraphs if len(CHINESE_RE.findall(text)) >= 10]


def _finish(lines: list[dict]) -> tuple[str, list[int]]:
    text = clean_text("".join(clean_text(line["text"]) for line in lines))
    xs = [line["bbox"][0] for line in lines]
    ys = [line["bbox"][1] for line in lines]
    rights = [line["bbox"][0] + line["bbox"][2] for line in lines]
    bottoms = [line["bbox"][1] + line["bbox"][3] for line in lines]
    return text, [min(xs), min(ys), max(rights), max(bottoms)]
