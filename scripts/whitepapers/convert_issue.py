#!/usr/bin/env python3
"""Generate the native, source-traceable issue 14 whitepaper reading asset.

This development-only converter deliberately has an issue-specific layout
manifest. The magazine is not a uniform grid: treating every page as one is
what previously put columns, headings and the school-cooperation ending out of
order.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

import pymupdf

from native.native_extract import can_continue, clean_text, lines_in_region, paragraphs_from_lines
from native.native_layout import ARTICLE_TITLE_FRAGMENTS, EXCLUDED_TEXT_AREAS, REGIONS, SECTION_TITLES, SUBHEADINGS


ROOT = Path(__file__).resolve().parents[2]
PDF = ROOT / "public/senlinqikan/pdf/14.pdf"
OUTPUT = ROOT / "src/data/whitepapers/14.json"
IMAGE_DIR = ROOT / "public/images/supply-chain-whitepapers/14"


def section_start(printed_page: int) -> int:
    return max(start for start, _title in SECTION_TITLES if start <= printed_page)


def section_source(printed_page: int) -> dict:
    return {"pdfPage": (printed_page + 2) // 2 + 1, "printedPage": printed_page, "side": "left" if printed_page % 2 == 0 else "right"}


def source(printed_page: int, side: str, bbox: list[float] | tuple[float, ...]) -> dict:
    return {"pdfPage": (printed_page + 2) // 2 + 1, "printedPage": printed_page, "side": side, "bbox": [round(value, 1) for value in bbox]}


def union_bbox(left: list[float], right: list[float]) -> list[float]:
    """Preserve the real enclosing source region when text lines are joined."""
    return [min(left[0], right[0]), min(left[1], right[1]), max(left[2], right[2]), max(left[3], right[3])]


# These are editorially meaningful figures, not page screenshots. All
# non-text-layer diagrams and each ambiguous roster remain as source-positioned
# crops instead of being reconstructed from unsafe PDF object order.
FIGURES = [
    (4, 4, "left", (66.07, 186.45, 294.52, 314.17), "textile-export-bar-chart.png", "原刊印刷页4的2024年9月—2025年3月纺织服装出口金额及同比图（文源自中国服装协会）"),
    (4, 4, "left", (320, 90, 548, 220), "textile-export-share-chart.png", "原刊印刷页4的纺织服装出口市场占比环形图（文源自中国服装协会）"),
    (4, 5, "right", (914.33, 412.21, 1140.56, 585.57), "textile-export-trend-chart.png", "原刊印刷页5的纺织服装出口趋势图（文源自中国服装协会）"),
    (6, 8, "left", (65, 478, 547, 750), "product-growth-core-insights.png", "原刊印刷页8的鞋服产品增长三大核心洞察图解（文：数字100）"),
    (6, 9, "right", (660, 305, 1142, 570), "product-growth-value-insights.png", "原刊印刷页9的鞋服产品复合价值判断图解（文：数字100）"),
    (7, 10, "left", (66.3, 497, 546.7, 767), "product-growth-trends.png", "原刊印刷页10的人群与产品适配：并非所有用户都在意同一件事（文：数字100）"),
    (7, 11, "right", (660, 450, 1142, 720), "product-growth-feedback.png", "原刊印刷页11的产品反馈机制图解（文：数字100）"),
    (8, 12, "left", (65.2, 341.4, 545.8, 611.6), "product-growth-decision-map.png", "原刊印刷页12的鞋服产品决策图解（文：数字100）"),
    (8, 13, "right", (660.7, 223.7, 1142.6, 494.6), "product-growth-growth-loop.png", "原刊印刷页13的鞋服产品增长图解（文：数字100）"),
    (9, 14, "left", (67, 433.1, 547.1, 703.6), "annual-meeting-group-photo.png", "原刊印刷页14的年度会议合影"),
    (10, 16, "left", (296.8, 82.6, 548.1, 271.2), "annual-meeting-session.png", "原刊印刷页16的年度会议现场照片"),
    (11, 18, "left", (66.2, 398.9, 293.0, 569.0), "annual-meeting-signing-left.png", "原刊印刷页18的年度会议签约现场照片"),
    (11, 18, "left", (318.9, 399.3, 545.7, 569.5), "annual-meeting-signing-right.png", "原刊印刷页18的年度会议签约现场照片"),
    (12, 20, "left", (300, 180, 550, 350), "cross-border-warehouse-photo.png", "原刊印刷页20的仓库建筑照片"),
    (12, 20, "left", (65, 432, 547, 605), "cross-border-challenges.png", "原刊印刷页20的跨境品牌四项挑战图解（图中文字未提供可提取文字层）"),
    (12, 20, "left", (65, 710, 547, 754), "cross-border-network.png", "原刊印刷页20的一体化跨境网络说明图解（图中文字未提供可提取文字层）"),
    (12, 21, "right", (660, 82, 1142, 226), "cross-border-fulfillment.png", "原刊印刷页21的国内集货、智能分拣与跨境头程图解（图中文字未提供可提取文字层）"),
    (12, 21, "right", (660, 284, 1142, 487), "cross-border-reverse-logistics.png", "原刊印刷页21的逆向物流和增值服务图解（图中文字未提供可提取文字层）"),
    (12, 21, "right", (660, 550, 1142, 754), "cross-border-order-system.png", "原刊印刷页21的全渠道订单智能履约图解（图中文字未提供可提取文字层）"),
    (13, 22, "left", (65, 115, 547, 325), "cross-border-cases.png", "原刊印刷页22的两个跨境战略合作案例图解（原刊匿名案例）"),
    (13, 22, "left", (65, 390, 547, 580), "cross-border-reasons.png", "原刊印刷页22的选择合作理由图解（图中文字未提供可提取文字层）"),
    (13, 22, "left", (65, 620, 547, 755), "cross-border-outlook.png", "原刊印刷页22的未来展望图解（原刊计划说明）"),
    (13, 23, "right", (660, 602, 1142, 754), "shanghai-traditional-challenges.png", "原刊印刷页23的传统仓储挑战图解（图中文字未提供可提取文字层）"),
    (14, 24, "left", (65, 120, 547, 350), "shanghai-cloud-warehouse-model.png", "原刊印刷页24的上海云仓一体化模型图解（图中文字未提供可提取文字层）"),
    (14, 25, "right", (904, 381, 1142, 542), "shanghai-specialist-capability.png", "原刊印刷页25的服装专业处理能力图解"),
    (14, 25, "right", (660, 622, 1142, 753), "shanghai-service-scenes.png", "原刊印刷页25的四类服务场景图解"),
    (15, 26, "left", (65, 127, 547, 350), "shanghai-customer-witness.png", "原刊印刷页26的客户见证指标卡片（历史原刊信息）"),
    (16, 28, "left", (97.4, 424.4, 257.5, 537.8), "anniversary-celebration-left.png", "原刊印刷页28的九周年纪念活动照片"),
    (16, 28, "left", (336.1, 424.4, 473.3, 537.8), "anniversary-celebration-right.png", "原刊印刷页28的九周年纪念活动照片"),
    (17, 30, "left", (68.2, 105.1, 420.6, 218.5), "employee-birthday.png", "原刊印刷页30的员工生日会合照"),
    (18, 32, "left", (66.9, 105.1, 360.5, 325.4), "xingtaicang-event-group.png", "原刊印刷页32的兴泰仓端午活动合影"),
    (18, 33, "right", (655, 515, 1148, 770), "rising-star-roster.png", "原刊印刷页33右侧的22位储备干部培养名单图表"),
    (19, 35, "right", (700, 270, 1142, 440), "awards-efficiency.png", "原刊印刷页35的产能效率快手奖名单图表"),
    (19, 35, "right", (700, 440, 1142, 600), "awards-employee.png", "原刊印刷页35的年度三好员工名单图表"),
    (19, 35, "right", (700, 600, 1142, 754), "awards-quality.png", "原刊印刷页35的质检高手奖名单图表"),
    (20, 36, "left", (65, 80, 555, 260), "awards-6s.png", "原刊印刷页36的现场6S大神奖名单图表"),
    (20, 36, "left", (65, 270, 350, 425), "awards-service.png", "原刊印刷页36的优质服务小二奖名单图表"),
    (20, 36, "left", (65, 435, 350, 580), "awards-stability.png", "原刊印刷页36的团队稳定基石奖名单图表"),
    (20, 36, "left", (365, 270, 555, 580), "awards-management.png", "原刊印刷页36的优秀管理帮主奖及人才培养伯乐奖名单图表"),
    (20, 37, "right", (954.3, 243.7, 1141.1, 383.8), "college-cooperation-group.png", "原刊印刷页37的校企合作合影"),
    (20, 37, "right", (660.8, 412.4, 1140.8, 532.7), "college-cooperation-recruitment.png", "原刊印刷页37的校企供需见面会招聘现场照片"),
]

FIGURE_NOTES = {
    20: "印刷页20的跨境挑战与网络图解保留为局部原图；图中文字没有可提取文字层，请对照 PDF 核对标签和数字。",
    21: "印刷页21的跨境履约图解保留为局部原图；图中文字没有可提取文字层，请对照 PDF 核对标签和数字。",
    22: "印刷页22的案例、合作理由和未来展望保留为局部原图；其中原刊计划说明不应视为已实现事实。",
    23: "印刷页23的传统仓储挑战图解保留为局部原图；图中文字没有可提取文字层。",
    24: "印刷页24的上海云仓模型图解保留为局部原图；图中文字没有可提取文字层。",
    33: "印刷页33右侧22位储备干部名单以局部原图保留；不依据碎片文字重新配对姓名与所属仓库。",
    35: "印刷页35的表彰名单按奖项局部原图保留；不依据 PDF 对象顺序重新配对姓名与仓库。",
    36: "印刷页36的表彰名单按奖项局部原图保留；不依据 PDF 对象顺序重新配对姓名与仓库。",
}


def block_from_extracted(raw: dict, printed_page: int, side: str) -> dict | None:
    text = raw["text"]
    if not text:
        return None
    title = dict(SECTION_TITLES).get(printed_page)
    if text in ARTICLE_TITLE_FRAGMENTS.get(printed_page, set()):
        return None
    if title and clean_text(title) in clean_text(text):
        return None
    kind = raw["type"]
    if printed_page == 31 and text not in {"活动启幕，共话发展", "凝心聚力，携手前行", "粽香送福，温暖同行", "定格美好，共叙情谊"}:
        kind = "paragraph"
    if kind == "subheading" and text not in SUBHEADINGS.get(section_start(printed_page), set()):
        kind = "paragraph"
    if text.startswith("◎") or "文源自：" in text or text.startswith("文："):
        kind = "quote"
    return {"type": kind, "text": text, "source": source(printed_page, side, raw["bbox"])}


def split_embedded_subheadings(block: dict) -> list[dict]:
    """Split audited display headings that share a PDF line with body text."""
    if block["type"] != "paragraph":
        return [block]
    text = block["text"]
    headings = [
        "致员工：你是仓库里最亮的光",
        "01全国分仓，同步快乐",
        "02每一份坚守，都值得被“点亮”",
        "03温暖，是最高效的“柔性供应链”",
        "活动启幕，共话发展",
        "凝心聚力，携手前行",
        "粽香送福，温暖同行",
        "定格美好，共叙情谊",
    ]
    for heading in headings:
        if text.startswith(heading) and len(text) > len(heading):
            body = text[len(heading):].lstrip("：，。 ")
            if body:
                heading_block = {**block, "type": "subheading", "text": heading}
                body_block = {**block, "text": body}
                return [heading_block, body_block]
    # A second heading can follow prose in an otherwise valid paragraph.
    for heading in headings:
        marker = text.find(heading, 12)
        if marker > 0:
            before, after = text[:marker].rstrip(), text[marker + len(heading):].lstrip("：，。 ")
            result = [{**block, "text": before}, {**block, "type": "subheading", "text": heading}]
            if after:
                result.append({**block, "text": after})
            return result
    for marker in ("此次合作与专场招聘，既是", "感恩同行，共赴新程"):
        position = text.find(marker, 12)
        if position > 0:
            return [{**block, "text": text[:position].rstrip()}, {**block, "text": text[position:]}]
    return [block]


def append_figure(section: dict, document: pymupdf.Document, figure: tuple) -> None:
    physical, printed, side, bbox, filename, caption = figure
    pixmap = document[physical - 1].get_pixmap(clip=pymupdf.Rect(*bbox), matrix=pymupdf.Matrix(2, 2), alpha=False)
    pixmap.save(IMAGE_DIR / filename)
    section["blocks"].append({"type": "figure", "src": f"/images/supply-chain-whitepapers/14/{filename}", "alt": caption, "caption": caption, "width": int((bbox[2] - bbox[0]) * 2), "height": int((bbox[3] - bbox[1]) * 2), "source": source(printed, side, list(bbox))})


def finish_page(sections: dict, document: pymupdf.Document, figures_by_page: dict, printed_page: int) -> None:
    target = sections[section_start(printed_page)]
    for figure in figures_by_page[printed_page]:
        append_figure(target, document, figure)
    if printed_page in FIGURE_NOTES:
        target["blocks"].append({"type": "review-note", "text": FIGURE_NOTES[printed_page], "source": section_source(printed_page)})


def main() -> None:
    document = pymupdf.open(PDF)
    if len(document) != 20:
        raise SystemExit(f"Expected 20 physical pages, got {len(document)}")
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    sections = {start: {"title": title, "source": section_source(start), "blocks": []} for start, title in SECTION_TITLES}
    figures_by_page: dict[int, list[tuple]] = defaultdict(list)
    for figure in FIGURES:
        figures_by_page[figure[1]].append(figure)

    last_page: int | None = None
    for region in REGIONS:
        if last_page is not None and region.printed_page != last_page:
            finish_page(sections, document, figures_by_page, last_page)
        excluded = EXCLUDED_TEXT_AREAS.get((region.physical_page, region.side), [])
        extracted = paragraphs_from_lines(lines_in_region(document[region.physical_page - 1], region.bbox, excluded), region.bbox[0])
        target = sections[section_start(region.printed_page)]
        for raw in extracted:
            block = block_from_extracted(raw, region.printed_page, region.side)
            if not block:
                continue
            for semantic_block in split_embedded_subheadings(block):
                if target["blocks"] and can_continue(target["blocks"][-1], semantic_block):
                    target["blocks"][-1]["text"] += semantic_block["text"]
                    target["blocks"][-1]["source"]["bbox"] = union_bbox(
                        target["blocks"][-1]["source"]["bbox"], semantic_block["source"]["bbox"]
                    )
                else:
                    target["blocks"].append(semantic_block)
        last_page = region.printed_page
    if last_page is not None:
        finish_page(sections, document, figures_by_page, last_page)

    payload = {
        "issue": "14", "originalTitle": "《森林期刊》第14期", "title": "鞋服产品增长、跨境供应链与上海云仓实践",
        "description": "本期收录鞋服行业产品升级与增长机会、纺织服装出口观察、跨境品牌仓配及上海云仓实践，并记录年度规划、团队培养与校企合作。依据《森林期刊》第14期整理，保留原文与PDF下载。",
        "sourcePdf": "/senlinqikan/pdf/14.pdf", "sourceSha256": hashlib.sha256(PDF.read_bytes()).hexdigest(),
        "sourcePublishedLabel": "2026年6月（封面标注）", "readingNotice": "本阅读版依据《森林期刊》第14期整理，原文中的年份、统计数字、案例与效果陈述保留其历史语境，不构成新亦源当前服务承诺或当前 KPI。",
        "sections": list(sections.values()),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {sum(len(section['blocks']) for section in payload['sections'])} semantic blocks and {len(FIGURES)} source crops")


if __name__ == "__main__":
    main()
