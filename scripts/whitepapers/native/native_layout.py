"""Audited reading-order manifest for the native issue 14 extractor.

Coordinates are PDF points.  A region is intentionally a real visual column or
band, never an inferred x-grid: the magazine switches between two-column news
layouts and single-column illustrated articles.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Region:
    physical_page: int
    printed_page: int
    side: str
    bbox: tuple[float, float, float, float]
    label: str = "body"


LEFT = (65.0, 60.0, 548.0, 760.0)
RIGHT = (660.0, 60.0, 1143.0, 760.0)


def _single_page_regions(physical_page: int) -> list[Region]:
    left_printed = 2 * (physical_page - 2)
    return [
        Region(physical_page, left_printed, "left", LEFT),
        Region(physical_page, left_printed + 1, "right", RIGHT),
    ]


# The source pages 3–5 are the only dense newspaper-style material.  Their
# visual columns are explicitly named here so PDF object insertion order cannot
# move a continuation before the paragraph it completes.
REGIONS: list[Region] = [
    Region(3, 2, "left", (105, 95, 505, 620), "anniversary"),
    Region(3, 3, "right", (655, 168, 895, 755), "overview-left"),
    Region(3, 3, "right", (905, 210, 1145, 755), "overview-right"),
    # Page 4 starts with the final trade-data paragraph, then its market
    # analysis has two visual columns.  Keep that top continuation first.
    Region(4, 4, "left", (60, 80, 300, 180), "trade-data-continuation"),
    Region(4, 4, "left", (60, 340, 300, 755), "market-left"),
    Region(4, 4, "left", (310, 210, 555, 755), "market-right"),
    Region(4, 5, "right", (655, 80, 900, 755), "market-middle"),
    Region(4, 5, "right", (905, 80, 1145, 755), "market-right"),
    Region(5, 6, "left", (60, 75, 300, 755), "export-left"),
    Region(5, 6, "left", (310, 75, 555, 755), "export-right"),
    Region(5, 7, "right", (655, 75, 900, 755), "export-left"),
    Region(5, 7, "right", (905, 75, 1145, 755), "export-right"),
]

# The remaining spreads are visually single-column stories with intentional
# upper/lower image bands.  Text is therefore read top-to-bottom inside each
# side, not re-sorted into guessed 170-point columns.
for _physical in range(6, 21):
    REGIONS.extend(_single_page_regions(_physical))


# Text that is represented by local, source-positioned figure crops.  Keeping
# it out of the text flow avoids inventing name/warehouse pairings from an
# arbitrary PDF object order.
EXCLUDED_TEXT_AREAS = {
    (18, "right"): [(655, 515, 1145, 770)],
    (19, "right"): [(655, 260, 1145, 760)],
    (20, "left"): [(60, 70, 555, 590)],
}


SECTION_TITLES = [
    (2, "九载峥嵘筑梦远，百年基业正当时"),
    (3, "严峻外贸形势下，一季度纺织服装出口仍然实现增长"),
    (8, "鞋服行业产品升级与增长机会白皮书"),
    (14, "稳进致远，共启新章：新亦源2025年度总结及2026计划会议圆满举办"),
    (20, "新亦源鞋服云仓加速国际化布局：携手跨境服装品牌，共筑全球供应链新生态"),
    (23, "新亦源上海服装云仓：立足华东，为时尚品牌提供智能仓配一体解决方案"),
    (27, "步履不停，热爱不止：新亦源鞋服云仓9周年生日快乐"),
    (29, "温暖出库，快乐上架：新亦源鞋服云仓一季度员工生日会暖心集锦"),
    (31, "粽情粽意・同心筑仓：新亦源兴泰仓开仓暨端午节员工慰问活动圆满举办"),
    (33, "启明星第二期｜22位储备干部正式集结，星光不负赶路人"),
    (35, "见证星光，致敬卓越｜新亦源2025年度表彰盛典荣光揭晓！"),
    (37, "校企携手启新程，共育物流新质人才——新亦源与广州华南商贸职业学院深化产教融合"),
]


# Display titles can wrap across source lines. They belong in the section H2,
# not as a second title below it. Exact fragments are easier to audit than a
# speculative font-size rule.
ARTICLE_TITLE_FRAGMENTS = {
    8: {"鞋服行业", "产品升级与增长机会白皮书"},
    14: {"稳进致远，共启新章 |", "新亦源2025年度总结", "及2026计划会议圆满举办"},
    20: {"新亦源鞋服云仓加速国际化布局：", "携手跨境服装品牌，共筑全球供应链新生态"},
    23: {"新亦源上海服装云仓：", "立足华东", "为时尚品牌提供智能仓配一体解决方案"},
    27: {"步履不停，热爱不止", "新亦源鞋服云仓9周年生日快乐"},
    29: {"温暖出库，快乐上架", "新亦源鞋服云仓一季度员工生日会暖心集锦"},
    31: {"粽情粽意・同心筑仓", "新亦源兴泰仓开仓暨端午节", "员工慰问活动圆满举办"},
    33: {"启明星第二期｜22位储备干部正式集结，", "星光不负赶路人"},
    35: {"见证星光，致敬卓越 |", "新亦源2025年度表彰盛典荣光揭晓！"},
    37: {"校企携手启新程，共育物流新质人才——", "新亦源与广州华南商贸职业学院深化产教融合"},
}


# Font size is not a trustworthy semantic signal in this magazine: illustrated
# body copy can be larger than a small blue heading.  This explicit audited
# allow-list is applied after extraction so only real in-article headings emit
# <h3>; every other large visual line remains ordinary prose.
SUBHEADINGS = {
    2: {"——写在公司成立九周年之际"},
    3: {"形势综述", "贸易数据", "市场分析"},
    8: {
        "鞋服行业的产品逻辑，正在发生三方面变化", "1）从单一卖点驱动，转向复合价值驱动", "2）新品节奏更快，但试错成本更高",
        "3）关键体验问题，往往在上市后才真正暴露", "从数据变化中，可以看到五个更明确的消费趋势",
        "品牌真正需要的，不是更多数据，而是更完整的产品反馈机制", "对于企业客户而言，这套机制最直接的价值，是支撑三类核心决策",
        "第一类，是上市前决策。", "第二类，是上市中决策。", "第三类，是上市后决策。", "值得关注的，不只是技术本身，而是产品决策正在变得更有依据", "结语",
    },
    14: {"会议前言", "锚定方向，回归本质", "01总经理发言", "02财务管理总结汇报", "03信息技术部总结汇报", "04运营管理部总结汇总", "05人力行政部总结汇报", "聚力深耕，服务升级", "01运营管理工作经验分享", "02客户盘点及满意度", "03客户服务意识再升级", "使命必达，行稳致远", "结语"},
    20: {"跨境品牌出海面临的四大关键挑战", "新亦源鞋服云仓：为跨境服装品牌打造的三大核心能力", "1.一体化跨境仓配网络", "2.专业鞋服逆向物流与增值服务一体化跨境仓配网络", "3.全渠道订单智能履约系统", "战略合作案例：", "为什么越来越多的跨境服装品牌选择与新亦源合作？"},
    23: {"上海服装企业的仓储困境", "传统仓储模式在上海面临严峻挑战", "新亦源上海云仓：定义华东时尚供应链新标准", "核心优势：为何上海服装企业应选择新亦源", "服务场景：我们为谁赋能", "客户见证：效率与增长的真实改变", "迈向智能未来：不止于仓储", "立即开启您的供应链革新之旅"},
    27: {"致客户：把后背交给我们，你放心"},
    29: {"01全国分仓，同步快乐", "02每一份坚守，都值得被“点亮”", "03温暖，是最高效的“柔性供应链”"},
    31: {"活动启幕，共话发展", "凝心聚力，携手前行", "粽香送福，温暖同行", "定格美好，共叙情谊"},
    33: {"01回顾这段旅程：每一步，都有回响", "02恭喜22位入选学员，你们的光芒被看见", "03即将启程：系统性培养，全方位赋能", "04致所有参与者：每一份向上，皆有光芒", "05初心如炬，步履向前"},
}
