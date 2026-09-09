"""Layout-aware helpers for archive OCR conversion; never used at request time."""
from __future__ import annotations

import re
from collections import defaultdict
from typing import Any


def compact(text: str) -> str:
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
    text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[，。；：！？、】【（）])", "", text)
    return re.sub(r"\s+", " ", text).strip()


def noise(text: str, y: int, image_height: int) -> bool:
    plain = text.replace(" ", "")
    if y < image_height * 0.055 or y > image_height * 0.94:
        return True
    if any(token in plain.lower() for token in ("http", "mp.weixin", "www.56xyy", "2026/7/7")):
        return True
    if "商图物流" in plain or "圈物流" in plain:
        return True
    if re.fullmatch(r"第?\d+页?(共\d+页)?|\d+/\d+", plain):
        return True
    if "新亦源森林" in plain and ("期刊" in plain or "双月刊" in plain):
        return True
    chinese = len(re.findall(r"[\u4e00-\u9fff]", plain))
    if chinese == 0 and len(plain) < 20:
        return True
    return False


def region_blocks(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Return OCR paragraphs in source order, never global y/x ``lines``.

    Tesseract's ``block`` is a layout container, not an editorial paragraph.  In
    particular, a two-column page may put several paragraphs in one block; keep
    its block/paragraph identity intact so the converter can decide whether a
    sentence continues in a later region.
    """
    words = data["words"]
    # A low final word is not evidence that the lower canvas is empty.  Use the
    # rendered PDF rectangle, otherwise valid bottom-of-page body lines vanish.
    image_height = round((data["source"]["pdfRect"][3] - data["source"]["pdfRect"][1]) * data["render"]["dpi"] / 72)
    grouped: dict[tuple[int, int, int], list[dict[str, Any]]] = defaultdict(list)
    order: list[tuple[int, int, int]] = []
    for word in words:
        key = (word["block"], word["paragraph"], word["line"])
        if key not in grouped:
            order.append(key)
        grouped[key].append(word)
    lines: list[dict[str, Any]] = []
    for key in order:
        line_words = grouped[key]
        text = compact(" ".join(word["text"] for word in line_words))
        x0 = min(word["bbox"][0] for word in line_words)
        y0 = min(word["bbox"][1] for word in line_words)
        x1 = max(word["bbox"][0] + word["bbox"][2] for word in line_words)
        y1 = max(word["bbox"][1] + word["bbox"][3] for word in line_words)
        if text and not noise(text, y0, image_height):
            lines.append({"key": key, "text": text, "bbox": [x0, y0, x1, y1]})
    result = []
    by_paragraph: dict[tuple[int, int], list[dict[str, Any]]] = defaultdict(list)
    paragraph_order: list[tuple[int, int]] = []
    for line in lines:
        key = line["key"][:2]
        if key not in by_paragraph:
            paragraph_order.append(key)
        by_paragraph[key].append(line)
    for block, paragraph in paragraph_order:
        rows = by_paragraph[(block, paragraph)]
        text = compact("".join(row["text"] for row in rows))
        chinese = len(re.findall(r"[\u4e00-\u9fff]", text))
        # Preserve short Chinese headings.  One- or two-character decoration and
        # image texture are not useful reading content.
        # Keep a short terminal fragment such as “能。”; it may continue a
        # preceding OCR paragraph at a column/page boundary.
        if chinese < 3 and not re.fullmatch(r"[\u4e00-\u9fff]{1,2}[。！？]", plain := text.replace(" ", "")):
            continue
        x0 = min(row["bbox"][0] for row in rows)
        y0 = min(row["bbox"][1] for row in rows)
        x1 = max(row["bbox"][2] for row in rows)
        y1 = max(row["bbox"][3] for row in rows)
        result.append({
            "text": text,
            "bbox": [x0, y0, x1, y1],
            "block": block,
            "paragraph": paragraph,
        })
    # Keep PSM 3's original paragraph order.  A global x/y sort interleaves
    # columns; conversion only changes reading order at an explicitly audited
    # left/right page boundary.
    return result


def heading_candidate(text: str) -> bool:
    plain = text.replace(" ", "")
    return 5 <= len(plain) <= 48 and not plain.endswith(("。", "，", "；", "："))
