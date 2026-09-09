#!/usr/bin/env python3
"""Generate source-traceable archive JSON from already-cached PSM 3 OCR."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
from pathlib import Path

import pymupdf

from ocr.archive_layout import heading_candidate, region_blocks

ROOT = Path(__file__).resolve().parents[2]
CATALOG = ROOT / "scripts/whitepapers/ocr/catalog.issues-1-13.json"
OCR_ROOT = ROOT / "output/whitepapers-ocr-layout"
PDF_ROOT = ROOT / "public/senlinqikan/pdf"
DATA_ROOT = ROOT / "src/data/whitepapers"
IMAGE_ROOT = ROOT / "public/images/supply-chain-whitepapers"

# Starts are transcribed from the source-audit's rendered contents pages.  The
# landscape series uses printed page numbers: even pages are left, odd pages
# right, and physical page = (printed + 2) // 2 + 1.  This is deliberately a
# small, reviewable editorial map rather than a heuristic based on OCR block
# count.
LANDSCAPE_ARTICLES: dict[int, list[tuple[int, str]]] = {
    6: [(2, "每个企业管理者都应具备总指挥意识"), (3, "谷歌在线购物引入生成式 AI，虚拟试穿成最新潮流"), (4, "纺织服装行业数据跟踪"), (6, "视频号如何助力服装品牌快速增长"), (9, "广检集团与新亦源第一期鞋服 QC 技能认证培训班成功举办"), (12, "新亦源信息化升级｜薪资系统正式上线"), (14, "六载砥砺，向新而行｜2023 年第 1 季度经营会议暨 6 周年司庆"), (16, "“荐”者有礼｜新亦源运到智能寄件平台活动"), (17, "时尚行业峰会新鲜速报｜新亦源在线为鞋服云仓行业赋能"), (18, "端午“粽”动员｜员工福利系列活动"), (20, "启明星课堂开课啦｜2023 开启学习计划"), (23, "运到智能寄件平台的应用价值"), (25, "职场成长路上的必备技能——总结"), (26, "一条心，一起拼｜技能标兵旅游奖励"), (27, "BAMA——逐梦远方｜2023 新亦源校园招聘补录"), (29, "“直播带岗 一起益企”新亦源在线直招")],
    7: [(2, "聚焦一口井 深挖一万米——新亦源服务之道"), (3, "品牌消费渐入佳境，纺织制造柳暗花明"), (6, "AI 风又吹到万亿级服装产业"), (10, "揭秘 0 库存印花 T 恤供应链"), (12, "庆新亦源佛山办事处开业大吉"), (13, "这就是新亦源，一个能打硬仗的团队！"), (14, "签约喜讯｜原创设计师品牌 PINPINPLUS 成功入驻番禺仓"), (15, "信息驱动，服务创新——2023 半年度总结及计划会议"), (19, "中秋特辑"), (22, "你最温暖的港湾——员工之声正式上线"), (23, "质检前置培训经验分享"), (24, "第一届启明星课堂精品课程讲师认证"), (28, "“薪”动招募：新亦源大家庭欢迎你")],
    8: [(2, "新年新启程：砥砺奋发，质效客户"), (3, "这个冬天羽绒服被狠狠地上了一课"), (6, "祝贺新亦源荣获全国时尚消费品行业数字化优秀解决方案奖"), (8, "物流突破创新案例：如何实现零库存服装供应链"), (11, "蓄势发展，兴业长新：新亦源又下一城"), (12, "热烈祝贺新亦源入围鞋服供应链合同物流全国前十强"), (13, "新亦源荣获 2023 LOG 供应链物流突破创新奖"), (14, "2023 双十一誓师动员大会"), (18, "2024 年度战略启动会"), (20, "合作共赢·探讨发展：新亦源参展年度峰会"), (21, "数字化物流系统：鞋服行业的战略之翼"), (23, "新亦源 2024 年度培训计划"), (27, "全面推动新亦源人才梯队建设"), (29, "新亦源与江门职业技术学院签订订单班合作")],
    9: [(2, "鞋服云仓：创新服务模式与 ESG 理念的完美融合"), (4, "潮流趋势新热潮——丁达尔风"), (6, "2024 年一季度中国服装行业经济运行分析"), (8, "携初心·再启程：2024 新亦源开工大会"), (9, "把专业做到极致：新亦源鞋服云仓质检服务介绍"), (13, "祝新亦源 7 周年生日快乐"), (15, "2024 年度会议成功举办"), (18, "植新绿·寓希望：2024 植树节活动"), (20, "星光筑梦·游历古今：年度表彰之旅"), (22, "启明星课堂：第一季度培训回顾及第二季度课程安排"), (26, "致敬：每一位努力奋斗、步履不停的你"), (27, "五年同行·感恩有您：赞颂坚守初心的力量"), (29, "2024 春季管培生座谈会暨拜师仪式")],
    11: [(2, "2024 成长 2025 质效"), (3, "新岁序开，万事开门红"), (4, "2024 年纺织服装专业市场运行分析"), (10, "2024 国际物流数字化生存报告：韧性、AI 与全球化新格局"), (12, "守护品质，智赢未来：新亦源助力服装企业排除风险"), (14, "齐新协力，持质以恒：2025 战略落地会议"), (16, "2024 新亦源各仓年会盛况回顾"), (20, "中秋“趣”团圆：各地分仓中秋精彩纷呈"), (22, "发掘人·用好人：精益管理从“新”开始"), (24, "评优表彰“追逐光，成为光”优秀支援者专访"), (26, "喜报：新亦源 2024 年表彰评优")],
    # These starts were checked against the later source pages as well as the
    # contents image.  Printed pp. 24/25 continue the p. 23 anniversary
    # report; they are not separate articles.
    12: [(2, "服装品牌的长寿法则——躺着卷"), (4, "5 月纺织服装出口分化加剧"), (9, "2025 年一季度中国服装行业经济运行分析"), (14, "中大型服装企业为何更适合新亦源云仓？"), (16, "2025 年 1–5 月中国物流运行分析"), (20, "致广大用户的一封信：公众号升级迁移的重要通知"), (21, "服装质检研究方向总结"), (23, "初心八载同欢庆，匠心织新共此时"), (26, "步履云端第一期：水声水库首站全纪实"), (27, "粽情端午，暖心相伴"), (29, "新亦源管理开放日·正式上线"), (30, "以赛促学，以劳为荣：看新亦源云仓如何“卷”出专业力"), (32, "温情汇聚，共谱花桥仓发展新篇——昆山花桥仓员工关怀活动纪实")],
    13: [(2, "从大阅兵到冠军仓：以整齐如一，铸就云仓标杆"), (3, "服饰混战白热化，企业如何寻找破局之道？"), (7, "从“爆单”到“崩盘”？——智能云仓时代下服装品牌大促仓储核心风控与战略升级"), (9, "邦宝与新亦源云仓战略合作开仓仪式"), (10, "新亦源与卓越商学战略合作项目启动"), (12, "初语向新亦源云仓东莞智谷仓团队送来鼓励"), (13, "新亦源 2026 年战略规划会议"), (14, "2025 半年度运营质量管理总结会议"), (18, "2025 级运营储备干部培养全记录"), (21, "肇庆四会仓 2025 第一季技能竞赛优秀标兵之旅"), (24, "树立 6S 标杆：肇庆仓全员聚力"), (26, "东莞电商仓第三季度优秀员工团建"), (28, "情暖双节，聚力前行｜东莞智谷仓")],
}

PORTRAIT_ARTICLES: dict[int, list[tuple[int, str]]] = {
    # Issue 10 is a WeChat print. p3 lower half is the original printed 4/5
    # spread; the upper half is publisher information and contents.
    10: [(3, "我们的故事"), (4, "单场 GMV 破亿，轻奢极简风女装在直播间爆发"), (6, "服装电商倒闭潮来袭：服装云仓或成破局关键"), (7, "花桥仓开仓、合肥开仓与总部乔迁"), (8, "夏日消暑行动与 618 特辑"), (9, "人效通升级与员工之声"), (10, "仓储服务效率与内推大作战")],
}

PUBLISHED_LABELS = {
    6: "2023 年夏刊（总第 06 期）", 7: "2023 年秋刊（总第 07 期）", 8: "2023 年冬刊（总第 08 期）", 9: "2024 年春刊（总第 09 期）",
    10: "封面标注：2024 年秋刊；电子刊前言标注：SUMMER（来源冲突未消解）", 11: "2025 年春刊（总第 11 期）", 12: "2025 年夏刊（原图目录日期串 03-07）", 13: "2025 年秋刊（总第 13 期）",
}

# One small visual source sample for each landscape issue. These are deliberate
# crops, never whole source pages; they give readers the original visual context
# where OCR cannot safely reproduce illustration/chart text.
FIGURE_CLIPS: dict[int, tuple[int, list[float], str, str]] = {
    6: (3, [310, 70, 600, 270], "“总指挥意识”文章页的插画", "原刊印刷第 2 页文章页眉插画"),
    7: (3, [285, 105, 600, 355], "《新亦源服务之道》文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
    8: (3, [285, 105, 600, 355], "《新年新启程》文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
    9: (3, [285, 105, 600, 355], "鞋服云仓与 ESG 文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
    10: (4, [0, 0, 300, 360], "轻奢极简风女装文章页视觉", "PDF physical page 4 左侧文章区域"),
    11: (3, [285, 105, 600, 355], "《2024 成长 2025 质效》文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
    12: (3, [285, 105, 600, 355], "服装品牌专题文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
    13: (3, [285, 105, 600, 355], "冠军仓专题文章页视觉", "原刊印刷第 2 页文章页眉视觉"),
}

# Luna visually reviewed each of these exact source regions.  They replace the
# earlier fixed “context” crop for issues 7–13.
AUDITED_FIGURES = [
    (6, 2, 4, "left", [220, 255, 550, 385], "fig1-2.png", "国内 328 棉指价格与 Cotlook A 价格指数趋势图", "原刊印刷第 4 页图 1 至图 2"),
    (6, 2, 4, "left", [220, 385, 550, 520], "fig3-4.png", "粘胶短纤与涤纶长丝价格趋势图", "原刊印刷第 4 页图 3 至图 4"),
    (6, 2, 4, "left", [220, 520, 550, 640], "fig5-6.png", "棕榈油与 LDPE 价格趋势图", "原刊印刷第 4 页图 5 至图 6"),
    (7, 1, 3, "right", [720, 190, 1140, 385], "spindle-workshop.png", "纺织制造车间的纺纱设备", "原刊印刷第 3 页纺织制造文章配图"),
    (7, 2, 4, "left", [60, 145, 550, 470], "market-trend-charts.png", "A 股纺织服装相关指数及盈利预测图组", "原刊印刷第 4 页市场趋势图组"),
    (8, 1, 3, "right", [760, 185, 1185, 545], "down-jacket-products.png", "三件绿色羽绒服展示图", "原刊印刷第 3 页羽绒服文章配图"),
    (8, 3, 5, "right", [660, 75, 1198, 495], "fashion-event-awards.png", "最美时尚之夜活动现场与奖项", "原刊印刷第 7 页活动现场照片"),
    (9, 0, 3, "right", [660, 180, 1195, 500], "hla-storefront.png", "HLA 服装门店与店内陈列", "原刊印刷第 3 页服装门店配图"),
    (9, 1, 4, "left", [60, 245, 550, 635], "fashion-market-charts.png", "服饰行业市场与指数折线图组", "原刊印刷第 4 页行业市场图组"),
    (10, 2, 6, "full", [140, 125, 300, 220], "ecommerce-warehouse.png", "服装云仓货架与周转箱", "PDF physical page 6 上半电商文章配图"),
    (10, 3, 6, "full", [130, 520, 255, 590], "crossborder-exterior.png", "跨境文章中的仓库建筑外景", "PDF physical page 6 下半跨境文章配图"),
    (10, 3, 6, "full", [380, 410, 500, 470], "crossborder-workspace.png", "跨境文章中的仓内货架与打包作业区", "PDF physical page 6 下半跨境文章配图"),
    (11, 4, 8, "left", [235, 375, 535, 600], "quality-inspection.png", "仓内质检与分拣流水线", "原刊印刷第 12 页质检文章配图"),
    (11, 5, 9, "left", [55, 260, 550, 665], "annual-meeting-collage.png", "团队活动与年会照片拼图", "原刊印刷第 14 页团队活动照片"),
    (12, 1, 4, "right", [600, 35, 1207, 320], "container-ship.png", "集装箱船与港口吊机", "原刊印刷第 5 页跨境物流配图"),
    (12, 2, 6, "right", [600, 5, 1207, 325], "textile-factory.png", "纺织车间与服装生产线", "原刊印刷第 9 页生产线配图"),
    (13, 1, 3, "right", [700, 175, 1170, 485], "hla-storefront.png", "HLA 门店正面与店内陈列", "原刊印刷第 3 页门店配图"),
    (13, 1, 4, "left", [55, 75, 305, 525], "company-market-table.png", "48 家公司营收、增幅与净利对照表", "原刊印刷第 4 页公司市场数据表"),
]

DESCRIPTIONS = {
    6: "收录管理者的总指挥意识、谷歌虚拟试穿、纺织服装行业数据、视频号运营，以及新亦源 QC、信息化和团队活动报道。",
    7: "收录服装供应链、零库存印花、服务与团队运营相关的行业观察和企业报道。",
    8: "收录服装供应链数字化、零库存案例、行业奖项、培训与人才发展的历史报道。",
    9: "收录鞋服云仓 ESG 服务模式、服装行业经济运行、质检服务和周年活动报道。",
    10: "收录轻奢女装直播、服装云仓、开仓乔迁和员工服务效率等内容；封面刊期与电子刊前言存在来源冲突。",
    11: "收录纺织服装市场、国际物流数字化、品质管理和年度战略相关报道。",
    12: "收录服装出口、行业经济、智能云仓、物流运行和质检运营相关内容。",
    13: "收录服装大促仓储风控、智能云仓、战略合作、运营质量和人才活动报道。",
}

NOISY_SECTION_NOTES = {
    7: {"AI 风又吹到万亿级服装产业": "文中 ERP/SAP 时间线与图表混排区域含 OCR 拉丁碎片，已移除碎片；请以 PDF 原图核对图表标签。", "这就是新亦源，一个能打硬仗的团队！": "该节信息图中的订单数字与照片旁文字未可靠 OCR，已移除碎片。"},
    8: {"这个冬天羽绒服被狠狠地上了一课": "产品图片与小字图注混排处含拉丁 OCR 碎片，已移除；保留可读正文和局部产品图。", "2023 双十一誓师动员大会": "授旗与出征照片叠字的 OCR 碎片已移除。", "数字化物流系统：鞋服行业的战略之翼": "系统架构图的英文/连线 OCR 碎片已移除。", "新亦源 2024 年度培训计划": "培训计划表的单元格 OCR 碎片已移除；表格请核 PDF 原版。"},
    9: {"启明星课堂：第一季度培训回顾及第二季度课程安排": "课程表格的仓库、讲师与课程单元混排，拉丁/符号碎片已移除；表格请核 PDF 原版。"},
    10: {"我们的故事": "physical p3 下半跨页首段有图片叠字 OCR 碎片，需以 PDF 原版核对。", "单场 GMV 破亿，轻奢极简风女装在直播间爆发": "直播截图、GMV 数字和图内小字未可靠 OCR，碎片已移除。", "夏日消暑行动与 618 特辑": "活动图片与质量服务信息图混排处的 OCR 碎片已移除。", "人效通升级与员工之声": "二维码、面试系统和安全海报混排处的 OCR 碎片已移除。"},
    11: {"新岁序开，万事开门红": "装饰性书法背景中的拉丁 OCR 碎片已移除。", "2024 国际物流数字化生存报告：韧性、AI 与全球化新格局": "报告配图及英文标识混排处的拉丁 OCR 碎片已移除。", "评优表彰“追逐光，成为光”优秀支援者专访": "人物照片旁的 OCR 碎片已移除。"},
    12: {"粽情端午，暖心相伴": "活动海报与祝福图中的拉丁 OCR 碎片已移除；海报内小字请核 PDF 原版。"},
    13: {"从“爆单”到“崩盘”？——智能云仓时代下服装品牌大促仓储核心风控与战略升级": "系统架构示意图的英文标签混排碎片已移除，保留可读正文。"},
}

# These are not language-quality rules.  Each key is a source-specific OCR
# failure that was visually checked against the printed page: either a table,
# screenshot, or decorative image was merged into a prose paragraph.  Keeping
# the surrounding prose while publishing the damaged token stream is worse
# than omitting that one region and pointing readers back to the source.
DROP_SOURCE_PARAGRAPHS: dict[int, tuple[str, ...]] = {
    6: ("ARE. MMR", "新员工入职培训森林种子", "心态调整发货 SOP", "仓库安全六大守则", "Wey 森林星光", "总结Low"),
    7: ("指数变动 -14%", "指数变动 +4%", "SAP 等园款厂商", "主持人发出"),
    8: ("TRERS. EA", "BARONE ABS", "RXKEBMAHS", "11210, RASA", "RIS. KSA", "EFCIO、", "订单交付管理平台", "人才梯队公开课 |"),
    9: ("OCARKENin", "SAC. REC", "培训地点 : SRS", "东莞电子东莞电子仓"),
    10: ("RAL,HOH", "SBCAMUTE", "ATMTAM", "ARNG—", "感情卡关 ?", "录， 未来入职时也无需重复填写"),
    11: ("MELT2022", "大家 ee fan庭", "ial 支援期间"),
    12: ("tei}PAIMBAR", "BE) (RBS)", "智能视觉共享实验室", "标准县八规范", "感情卡关 ?", "成长焦虑 ?", "大家 ee fan庭"),
    13: ("Shin SRST",),
}


def source_specific_clean(issue: int, text: str) -> str | None:
    """Remove only a known, inspected non-prose OCR merge.

    Returning ``None`` means that the source area is represented by the
    section's precise review note or a bounded figure, never by invented text.
    """
    compact = text.replace(" ", "")
    if any(marker.replace(" ", "") in compact for marker in DROP_SOURCE_PARAGRAPHS.get(issue, ())):
        return None
    # The following two blocks have a clean leading sentence followed by words
    # sampled from an adjacent illustration.  Preserve the verified prose only.
    if issue == 9 and "当日订单当日发" in text:
        return text.split("OCARKENin", 1)[0].rstrip("，。 ") + "。"
    if issue == 13 and "二、 名单揭晓" in text:
        return "二、名单揭晓"
    if issue == 13 and "四、 表彰先进" in text:
        return "四、表彰先进：建言献策，彰显担当"
    return text


# A second, deliberately conservative pass for text which passed character-
# level OCR filters but is still not publishable prose.  These markers were
# found while reading the resulting JSON against the source pages.  Each
# omitted block leaves a note on exactly the same source bbox; this is not a
# substitute for an unavailable sentence.
UNREADABLE_PUBLIC_MARKERS: dict[int, tuple[str, ...]] = {
    6: ("东莞电商东莞", "工作地点 : CN", "专卖店 | as"),
    7: ("数据威统计", "带来噬头", "技术能和否", "服装鞋帼", "因素的晋加", "莒业利润", "捷地制造", "时尚更", "整晋打包", "印花 T 和", "服装企业仓储主要特征"),
    8: (
        "@ 路年", "大学生入冬指南 ” 与", "不起， 而是感冒灵", "羽绒服， 羽绒服",
        "而另一方面， 在波司登", "MEARS |", "手绘图案手作", "同色系层次搭配", "原创 LOGO", "三治愈色系", "MAREE DEAR",
    ),
    9: ("鞋服云仑 :ESG", "时尚娃服市场", "@ 聚焦鞋服", "创新服务异式与", "© 100% 库存准确率", "MEARS |", "NTOT 新年款", "6 a8 Emesus", "上海汇金仓森林装备", "库存风险 it外", "生机竹然", "窒身裤", "球锡的面料", "抖音电商服饰行业携对", "收寄", "收窒", "年主曹业务", "ik据国家统计局"),
    11: ("年纺织服装专业市场数量与与成交", "装专业市场打造", "装内外贸一体化"),
    12: ("服装品牌的长寿法则一一", "退货率帮升", "退货率从10% 闫升", "集团菌曼", "不断抱外经济环境", "运莒能力", "下水道的处理", "pak. 本全用", "大促莒销", "5 月纺织", "装出口分化加剧，", "对美出口了降", "ID 管制问题", "系走向稳定", "VARA:", "针权织服装", "降幅收窒", "需等定信心", "增速比2023", "据，1-3 月", "我国标计完成", "莒销和服务", "库存准确率低大促期间", "于加下"),
    10: ("DBHR 安排面试",),
    13: ("伙伴们，“ 九四", "如今， 商场如战场", "回首八年前， 在同样的物流云仓赛道", "装品牌增长的引", "TREE心", "美邦服饰莒收", "莒收净利", "增速仪 1.9%", "始祖岛", "年店效低于", "2025 年磺出", "干万爆款", "战占领", "智能云仑时代", "SRE 〈", "BARB:", "Sik:", "运莒质量", "共赴更精彩的下一"),
}


def normalized(text: str) -> str:
    return re.sub(r"[\s:：—\-－一]+", "", text).replace("《", "").replace("》", "")


def visible_source_label(source: dict) -> str:
    side = {"left": "左侧", "right": "右侧", "full": "整页"}.get(source["side"], source["side"])
    bbox = ", ".join(str(value) for value in source["bbox"])
    return f"PDF physical page {source['pdfPage']}，{side}，bbox [{bbox}]"


def sanitize_public_sections(issue: int, sections: list[dict]) -> None:
    """Keep the public reading surface to normal, source-readable prose.

    Blocks rejected here remain recoverable in the offline PSM3 cache.  The
    generated note makes the exact PDF region reviewable instead of presenting
    a partial cross-column line as a sentence.
    """
    for section in sections:
        revised: list[dict] = []
        for block in section["blocks"]:
            if block.get("type") != "paragraph":
                revised.append(block)
                continue
            text = block.get("text", "").strip()
            if not text:
                continue
            if normalized(text) == normalized(section["title"]):
                continue
            # A leading conjunction/syllable, a table delimiter, or a run of
            # Latin capitals is evidence of a partial column or image label,
            # not a readable Chinese paragraph.  Proper names such as AI,
            # GMV and COCO ZONE remain permitted.
            structural_fragment = (
                text.startswith(("与", "装", "那", "九", "临", "较", "系", "ID "))
                or "|" in text
                or bool(re.search(r"[A-Z]{6,}", text))
            )
            if any(marker in text for marker in UNREADABLE_PUBLIC_MARKERS.get(issue, ())) or structural_fragment:
                revised.append({
                    "type": "review-note",
                    "text": f"《{section['title']}》：{visible_source_label(block['source'])}。该处为跨栏、图文叠加、表格或断行造成的不可可靠 OCR 片段，未作为正文发布；请核对该原 PDF 区域。",
                    "source": block["source"],
                })
                continue
            # Decorative OCR often writes a source line as an ordinary
            # paragraph.  Preserve a readable attribution but remove the
            # leading OCR glyph from the reading flow.
            if re.match(r"^[O@©]\s*(?:文|转载|文摘)", text):
                text = re.sub(r"^[O@©]\s*", "◎ ", text)
                block = {**block, "type": "quote", "text": text}
            elif issue == 7 and text.startswith("聚焦一口井深挖一万米"):
                block = {**block, "type": "quote", "text": "◎ 新亦源管理咨询顾问 梁沈"}
            else:
                # These substitutions are limited to source-verified proper
                # nouns recurrently misread by Tesseract in the cached pages.
                text = (text.replace("拌音", "抖音").replace("Al", "AI")
                    .replace("不享负", "不辜负").replace("退货率帮升", "退货率攀升")
                    .replace("临前所未有的挑战", "面临前所未有的挑战")
                    .replace("企会议上", "在会议上"))
                block = {**block, "text": text}
            revised.append(block)

        # The issue-12 headline was split into two short OCR paragraphs.  It
        # is already the section H2, so neither fragment belongs in body text.
        section["blocks"] = revised


def annotate_review_notes(sections: list[dict]) -> None:
    """Make every visible review aside independently actionable in the UI."""
    for section in sections:
        for block in section["blocks"]:
            if (
                block.get("type") != "review-note"
                or ("PDF physical page" in block.get("text", "") and "bbox [" in block.get("text", ""))
            ):
                continue
            block["text"] = f"《{section['title']}》：{visible_source_label(block['source'])}。{block['text']}"


def direct_source(issue: int, pdf_page: int, printed_page: int | None, side: str, bbox: list[float]) -> dict:
    return {"pdfPage": pdf_page, "printedPage": printed_page, "side": side, "bbox": bbox}


def source(issue: int, region: dict, bbox: list[int]) -> dict:
    clip = region["source"]["pdfRect"]
    scale = region["render"]["dpi"] / 72
    x0, y0, x1, y1 = bbox
    physical_page = region["source"]["physicalPage"]
    side = region["source"]["side"]
    printed_page = None
    if issue in LANDSCAPE_ARTICLES and physical_page >= 3:
        printed_page = 2 * (physical_page - 3) + (2 if side == "left" else 3)
    return {
        "pdfPage": physical_page,
        "printedPage": printed_page,
        "side": side,
        "bbox": [round(clip[0] + x0 / scale, 1), round(clip[1] + y0 / scale, 1), round(clip[0] + x1 / scale, 1), round(clip[1] + y1 / scale, 1)],
    }


def title_for(entry: dict) -> str:
    return entry["seoTitleProposal"]


def landscape_location(printed: int) -> tuple[int, str]:
    return ((printed + 2) // 2 + 1, "left" if printed % 2 == 0 else "right")


def article_starts(issue: int) -> list[tuple[tuple[int, str], str]]:
    if issue in LANDSCAPE_ARTICLES:
        return [(landscape_location(printed), title) for printed, title in LANDSCAPE_ARTICLES[issue]]
    return [((page, "full"), title) for page, title in PORTRAIT_ARTICLES[issue]]


def record_key(data: dict) -> tuple[int, int]:
    return (data["source"]["physicalPage"], {"left": 0, "full": 0, "right": 1}[data["source"]["side"]])


def portrait_include(issue: int, page: int, block: dict) -> bool:
    """Exclude only visually audited cover/contents areas, never whole pages."""
    if issue == 10 and page == 3:
        return block["bbox"][1] >= 1100
    # Physical p1 of issue 1 starts the foreword at roughly 69% of its A4 print.
    if issue == 1 and page == 1:
        return block["bbox"][1] >= 1450
    return True


def is_usable_paragraph(text: str) -> bool:
    plain = text.replace(" ", "")
    chinese = len(re.findall(r"[\u4e00-\u9fff]", plain))
    letters = len(re.findall(r"[A-Za-z0-9]", plain))
    # Reject image texture and OCR fragments, not genuine short headings.  The
    # markers below are observed only in page furniture/diagram OCR and are
    # intentionally not a language-quality proxy for normal prose.
    diagram_markers = ("商图物流", "PES)", "TaN", "RISB", "<__", "-se]", "多wh)", "KiCHSARK", "FPBEUWP", "20000849", "所在区域所在仓库", "a8a8e", "Pt,HPAL", "bbeIGMV", "mAQR", "对PRTEANIS", "RNSARE", "Emtveanom", "MtMii", "DUTRR", "数字化物流系统犹如", "用用用用", "RAL,HOH", "SBCAMUTE", "ATMTAM", "ARNG—", "MELT2022")
    terminal_fragment = bool(re.fullmatch(r"[\u4e00-\u9fff]{1,2}[。！？]", plain))
    return (
        (chinese >= 3 or terminal_fragment)
        and chinese * 1.25 >= letters
        and not any(marker in plain for marker in diagram_markers)
        and not re.fullmatch(r"[—_.,:;|/\\\\]+", plain)
    )


def generated_sections(issue: int, entry: dict) -> list[dict]:
    manifest = json.loads((OCR_ROOT / f"issue-{issue:02d}" / "manifest.json").read_text(encoding="utf-8"))
    if manifest["sourceSha256"] != entry["source"]["sha256"]:
        raise RuntimeError(f"issue {issue}: OCR cache hash does not match source PDF")
    records = []
    for result in sorted(manifest["ocrResults"], key=lambda item: (item["page"], {"left": 0, "full": 0, "right": 1}[item["side"]])):
        path = OCR_ROOT / f"issue-{issue:02d}" / f"page-{result['page']:03d}{'' if result['side'] == 'full' else '-' + result['side']}.lines.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        if data["source"]["sha256"] != entry["source"]["sha256"]:
            raise RuntimeError(f"issue {issue}: {path.name} source hash mismatch")
        if data["source"]["physicalPage"] != result["page"] or data["source"]["side"] != result["side"]:
            raise RuntimeError(f"issue {issue}: {path.name} region identity mismatch")
        for block in region_blocks(data):
            if portrait_include(issue, data["source"]["physicalPage"], block) and is_usable_paragraph(block["text"]):
                records.append((data, block))
    starts = article_starts(issue)
    start_positions = [(location, title) for location, title in starts]
    sections = []
    for index, (location, title) in enumerate(start_positions):
        end = start_positions[index + 1][0] if index + 1 < len(start_positions) else None
        group = [(data, block) for data, block in records if record_key(data) >= (location[0], {"left": 0, "full": 0, "right": 1}[location[1]]) and (end is None or record_key(data) < (end[0], {"left": 0, "full": 0, "right": 1}[end[1]]))]
        if not group:
            continue
        first_data, first = group[0]
        blocks = []
        for data, block in group:
            text = source_specific_clean(issue, block["text"])
            if text is None:
                continue
            block_source = source(issue, data, block["bbox"])
            if re.search(r"(?:文\s*/|作者|撰文)", text) and len(text) < 80:
                blocks.append({"type": "quote", "text": text, "source": block_source})
            else:
                blocks.append({"type": "paragraph", "text": text, "source": block_source})
        if not any(block["type"] == "paragraph" for block in blocks):
            continue
        sections.append({"title": title, "source": source(issue, first_data, first["bbox"]), "blocks": blocks})
    if not sections:
        raise RuntimeError(f"issue {issue}: no readable OCR blocks")
    # Make uncertainty explicit rather than manufacturing OCR text for every image.
    sections[0]["blocks"].append({
        "type": "review-note",
        "text": "本期由无可靠文字层的原稿 OCR 整理；图表、照片内文字、名单及跨栏或低置信区域须以 PDF 原版复核。",
        "source": sections[0]["source"],
    })
    return sections


def curate_issue_six(sections: list[dict]) -> None:
    """Only source-verified character/line corrections; never summarize prose."""
    for block in sections[0]["blocks"]:
        if block.get("text") == sections[0]["title"]:
            block["text"] = ""
        if "text" in block:
            block["text"] = block["text"].replace("敬旦之心", "敬畏之心").replace("刀炼人才", "锻炼人才")
    sections[0]["blocks"] = [block for block in sections[0]["blocks"] if block.get("text", "")]


def curated_section(
    title: str, pdf_page: int, printed_page: int | None, bbox: list[float], blocks: list[dict], side: str = "full"
) -> dict:
    return {"title": title, "source": {"pdfPage": pdf_page, "printedPage": printed_page, "side": side, "bbox": bbox}, "blocks": blocks}


def curate_issue_six_tail(sections: list[dict]) -> None:
    virtual_blocks = []
    for block in sections[1]["blocks"]:
        text = block.get("text", "")
        if text.startswith("谷歌在线购物引入生成式 AI") or text.startswith("虚拟试穿成最新潮流"):
            continue
        if text.startswith("谷歌虚拟试穿功能") or text.startswith("AR 技术的广泛应用"):
            block["type"] = "subheading"
        if "text" in block:
            block["text"] = (text.replace("生成式Al", "生成式 AI").replace("生成式 Al", "生成式 AI")
                .replace("生成式 A 人", "生成式 AI").replace("日， 谷歌", "近日， 谷歌")
                .replace("生成式 AI方面", "生成式 AI 方面").replace("Snapchat 昌然", "Snapchat 虽然")
                .replace("© 文 /摘录", "◎ 文／摘录"))
        virtual_blocks.append(block)
    for index, block in enumerate(virtual_blocks[:-1]):
        current = block.get("text", "")
        following = virtual_blocks[index + 1].get("text", "")
        if (current.endswith("退货") and following.startswith("率。")) or (current.endswith("建立更") and following.startswith("为紧密的联系")) or (current.endswith("新功") and following == "能。"):
            block["text"] += following
            virtual_blocks[index + 1]["text"] = ""
    sections[1]["blocks"] = [block for block in virtual_blocks if block.get("text", "")]
    chart_source = direct_source(6, 4, 4, "left", [230, 205, 540, 710])
    sections[2]["blocks"] = [
        {"type": "quote", "text": "◎ 文／摘录自信达证券、汲肖飞", "source": direct_source(6, 4, 4, "left", [65, 112, 270, 135])},
        {"type": "subheading", "text": "上游数据跟踪：商业库存下滑、减产预期之下，国内棉价震荡上行", "source": direct_source(6, 4, 4, "left", [62, 250, 240, 340])},
        {"type": "paragraph", "text": "从原材料价格来看，截至 2023 年 7 月 7 日，中国 328 级棉价为 17419 元／吨，周涨幅为 0.66%，Cotlook A 价格指数市场价为 91.75 美分／磅，周涨幅为 3.21%。截至 2023 年 6 月 30 日，粘胶短纤市场价、涤纶长丝市场价分别为 12900 元／吨、7340 元／吨，周涨幅为 -1.53%、-1.87%，较年初增幅分别为 0.78%、-1.48%。", "source": direct_source(6, 4, 4, "left", [65, 340, 235, 700])},
        {"type": "paragraph", "text": "国内棉价方面，近期下游纺企采购需求偏弱，但商业库存持续下滑叠加棉花减产预期，国内棉价震荡上行。国际棉价方面，美国棉花实播面积同比减少，供应端偏紧支撑美棉价格；但下半年美联储两次加息预期令美元指数整体延续偏强走势，预计未来将对美棉价格形成一定压力。", "source": direct_source(6, 4, 4, "left", [65, 470, 235, 700])},
        {"type": "figure", "src": "/images/supply-chain-whitepapers/6/textile-upstream-charts.png", "alt": "纺织服装行业数据跟踪页的上游价格图表", "caption": "原刊印刷第 4 页图 1 至图 8（图内数值请核 PDF 原版）", "width": 465, "height": 758, "source": chart_source},
        {"type": "subheading", "text": "下游数据跟踪：5 月服装零售温和增长", "source": direct_source(6, 4, 5, "right", [650, 105, 1120, 135])},
        {"type": "paragraph", "text": "2023 年 5 月国内服饰鞋帽针纺织品零售额为 1076 亿元，同比增长 12.26%，两年平均复合增速为 -2.41%；1—4 月零售额为 4653 亿元，同比增长 13.95%，实物商品网上零售额穿类增长 13.50%。2023 年 1 月由于大规模群体阳性后，居民多居家休息、减少外出，消费需求受到短暂影响。3—4 月以来出行及户外活动恢复，服装等可选消费在低基数背景下实现强劲反弹，4 月增幅持续扩大，复苏势头强劲。5 月份消费需求进入稳健复苏阶段，呈现温和向好态势，但相对于 21 年同期仍有小幅下降。", "source": direct_source(6, 4, 5, "right", [650, 150, 890, 570])},
        {"type": "subheading", "text": "越南数据跟踪：纺织品鞋类出口降幅放缓", "source": direct_source(6, 4, 5, "right", [650, 600, 885, 680])},
        {"type": "paragraph", "text": "短期受到全球主要经济体需求疲软影响，越南纺服及鞋类出口企业订单同比下滑。2023 年 6 月越南纺织品、鞋类出口金额为 31.0 亿美元、19.5 亿美元，同比下降 15.07%、22.00%，较上月降幅大幅收窄。长期来看，越南制造企业将持续推进可持续发展战略、深度嵌入全球供应链。", "source": direct_source(6, 4, 5, "right", [650, 680, 1120, 770])},
        {"type": "review-note", "text": "PDF physical page 4 的图 1 至图 14 为小尺寸图表；此前 OCR 把图例和曲线误识别为正文，现已移除，仅保留局部图和可读叙述。", "source": chart_source},
    ]
    sections[3]["blocks"] = [
        {"type": "quote", "text": "◎ 图文／转载自@三里屯信息流原创", "source": direct_source(6, 5, 6, "left", [65, 115, 320, 138])},
        {"type": "paragraph", "text": "内卷成红海的直播间，2023 年还值得新人投入吗？经常有商家埋怨，觉得开直播没人来看，浪费时间，哪怕花重金请来的运营，也解决不了问题。", "source": direct_source(6, 5, 6, "left", [65, 210, 280, 350])},
        {"type": "paragraph", "text": "但另一边，今年不打烊的直播间也越来越多了，尤其在节假日，很多商家根本没得休息，订单多得忙到脚不离地。实际上，用好了工具，找对方向，每个营销节点都是引流、卖货的机会，直播新人也有广阔的玩法空间。", "source": direct_source(6, 5, 6, "left", [65, 350, 280, 450])},
        {"type": "paragraph", "text": "我发现，很多品牌不容错过的，就是正在狂飙的视频号。再加上腾讯对短视频和直播的大力扶持，2023 年品牌如果想大力拓展私域流量，最需要抓住的趋势，可以说就是视频号。", "source": direct_source(6, 5, 6, "left", [65, 390, 280, 500])},
        {"type": "paragraph", "text": "视频号作为被微信提升到核心地位的内容生态，可以连接国人常用的企业微信、公众号、小程序等，让品牌既能从公域流量中获取新客，又能从私域流量中挖掘用户价值。", "source": direct_source(6, 5, 6, "left", [65, 500, 280, 560])},
        {"type": "subheading", "text": "服装品牌视频号直播间，都暗藏什么“玄机”？", "source": direct_source(6, 5, 7, "right", [330, 210, 570, 280])},
        {"type": "paragraph", "text": "不同服装品牌的视频号直播间，有几种类型：前期短视频立人设，带动直播病毒式传播；有重点投入直播矩阵的，如歌莉娅、影儿和报喜鸟等，会结合公私域运营，开播主推单品；还有一种利用视频号裂变，以粉丝预约直播，实现直播预约人数的裂变增长。", "source": direct_source(6, 5, 7, "right", [330, 280, 570, 560])},
        {"type": "figure", "src": "/images/supply-chain-whitepapers/6/video-channel-live-examples.png", "alt": "视频号服装直播案例截图", "caption": "原刊印刷第 6 页的直播案例截图（截图内文字未转录）", "width": 690, "height": 360, "source": direct_source(6, 5, 6, "left", [65, 560, 525, 800])},
        {"type": "review-note", "text": "PDF physical page 5 底部为直播截图；其中账号数据、商品价格和屏幕内文字未由 OCR 转录。", "source": direct_source(6, 5, 6, "left", [65, 560, 525, 800])},
    ]


def curate_issue_ten(sections: list[dict]) -> None:
    """physical p6/p7 contain four embedded printed pages, read TL→TR→BL→BR."""
    def rendered_box(bbox: list[float]) -> list[float]:
        # These editorial coordinates came from the existing 200 dpi A4 render.
        # Persist only PDF points (72 pt/in) in JSON source metadata.
        return [round(value * 72 / 200, 1) for value in bbox]

    def block(text: str, page: int, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(10, page, None, "full", rendered_box(bbox))}

    electric = curated_section("服装电商倒闭潮来袭：服装云仓或成破局关键", 6, None, rendered_box([130, 100, 820, 1040]), [
        block("2024 年，服装行业风云变幻，令人震惊的是，据不完全统计至今已有超过 40 家服装网店倒闭或停止上新，其中甚至包括粉丝过百万的知名企业。这一现象引发了行业的广泛关注和深思，究竟是什么原因导致了它们的衰落？", 6, [130, 460, 820, 850]),
        block("原因剖析", 6, [130, 610, 500, 700], "subheading"),
        block("库存管理失控：大量库存占用了企业大量资金，导致资金链断裂；运营成本高涨：仓库租赁、人力成本等不断攀升，压缩了企业利润空间；退换货居高不下：消费者对服装的品质、尺码、款式等要求越来越高，一旦不符合预期会选择退货。", 6, [130, 610, 820, 1000]),
        {"type": "figure", "src": "/images/supply-chain-whitepapers/10/cloud-warehouse-floor.png", "alt": "服装云仓文章页中的仓内作业场景", "caption": "PDF physical page 6 上半右侧仓内场景", "width": 375, "height": 188, "source": direct_source(10, 6, None, "full", [300, 235, 550, 360])},
        block("PDF physical page 6 上半为原刊印刷页 14/15；其中仓库照片未转录为正文。", 6, [840, 530, 1510, 1000], "review-note"),
    ])
    cross_border = curated_section("物流革命：跨境电商如何借力服装云仓", 6, None, rendered_box([130, 1070, 820, 2110]), [
        block("在全球化的浪潮中，跨境电商如同一艘艘航船，穿梭于国际市场的波涛之中。而服装云仓服务，便是这些航船上不可或缺的稳定之锚，为品牌企业提供坚实的后勤支持。今天，我们将探讨服装云仓如何为跨境电商提供专业服务，并揭示它们如何成为跨境电商成功的关键因素。", 6, [130, 1180, 820, 1480]),
        block("全球布局、无缝对接；智能管理、精准高效", 6, [130, 1490, 820, 2040], "subheading"),
        block("我们在关键节点城市设立仓储，确保了货物能够快速、高效地流转至世界各个角落。借助先进的仓储管理系统，我们实现了对库存的精准控制和实时更新。无论是复杂的物流需求，还是特殊的存储条件，我们都能提供个性化的解决方案。", 6, [130, 1490, 820, 2050]),
        block("PDF physical page 6 下半为原刊印刷页 16/17；版内照片和蓝色信息图只作为原图证据，不由 OCR 逐项转写。", 6, [840, 1180, 1510, 2050], "review-note"),
    ])
    flower = curated_section("喜报连连：新亦源鞋服云仓花桥仓开仓大吉", 7, None, rendered_box([130, 100, 820, 1040]), [
        block("在鞋服云仓行业中持续扩展和创新的我们，又迎来了新的里程碑——昆山花桥新仓开仓！至今已正式运营一段时间了，展现了令人瞩目的运营效率和业务增长潜力。自开业以来，昆山花桥新仓不仅加强了我们在华东地区的物流网络布局，更具体地提升了我们对当地及周边客户的服务能力和响应速度。", 7, [130, 510, 820, 800]),
        {"type": "figure", "src": "/images/supply-chain-whitepapers/10/huaqiao-warehouse-scenes.png", "alt": "花桥仓文章页中的货架与仓内场景", "caption": "PDF physical page 7 上半右侧仓内照片", "width": 248, "height": 263, "source": direct_source(10, 7, None, "full", [385, 190, 550, 365])},
        block("PDF physical page 7 上半为原刊印刷页 18/19。", 7, [840, 140, 1510, 990], "review-note"),
    ])
    hefei = curated_section("合肥开仓势如破竹，首日万鞋入库显神威", 7, None, rendered_box([130, 1070, 820, 2110]), [
        block("近日，新亦源鞋服云仓合肥仓迎来了它的首日运营。这不仅标志着我们服务能力的进一步扩展，也象征着华东地区物流行业迈入了一个全新的发展阶段。开业当天，仓库就迎来了 10000 双鞋子的入库操作，我们的团队都忙得不亦乐乎，这一成绩是我们团队协作和执行力的一次重要检验。", 7, [130, 1260, 820, 2000]),
        block("原刊中的“万鞋”等表述为当期活动报道，未在本阅读版扩展为当前服务能力。", 7, [130, 1260, 820, 2000], "review-note"),
    ])
    relocation = curated_section("新起点·新使命·新征程：新亦源总部乔迁之喜", 7, None, rendered_box([840, 1070, 1510, 2110]), [
        block("在这绚烂的夏日里，我们带着满腔的热情和无限的憧憬，迎来了一个重要消息：新亦源总部正式搬迁到了一个新的地点啦！这不仅是一次简单的搬迁，更是我们企业发展历程中的一个重要里程碑，它标志着我们即将踏在新的舞台上，书写更加辉煌的篇章。", 7, [840, 1160, 1510, 2020]),
        block("PDF physical page 7 右下为原刊印刷页 21；活动日期和现场图片文字请核 PDF 原版。", 7, [840, 1160, 1510, 2020], "review-note"),
    ])
    sections[2:4] = [electric, cross_border, flower, hefei, relocation]


def curate_issue_ten_page_eight(sections: list[dict]) -> None:
    """Keep p22, p23–24 and p25 as their three printed articles.

    Physical p8 is an A4 WeChat print containing four original-page panels.
    The lower left panel continues the summer article; it does not continue
    the headquarters-move article at upper left or the 618 article at lower
    right.  These source bounds deliberately identify each printed-page body
    rather than pretending the verified transcriptions are OCR line boxes.
    """
    move = [75, 35, 290, 390]
    summer_opening = [300, 35, 520, 390]
    summer_close = [75, 405, 290, 780]
    sale = [300, 405, 520, 780]

    def block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(10, 8, None, "full", bbox)}

    relocation = next(section for section in sections if section["title"] == "新起点·新使命·新征程：新亦源总部乔迁之喜")
    relocation["blocks"] = [
        block for block in relocation["blocks"] if block["type"] != "review-note"
    ] + [
        block("03 新的根据地", move, "subheading"),
        block("新的起点，新的环境，新的可能性。我们的新总部位于黄埔区果园一路 2 号。在这里，我们拥有更加宽敞的办公空间以及更加舒适的工作环境，为我们的团队提供了一个更好的创造和发展的平台。", move),
        block("在此，我们诚挚欢迎您，来我们的“新家”做客。期待在新的征程中，与您一起前行！", move),
        block("PDF physical page 8 左上为总部乔迁文章的印刷第 22 页续文；仪式照片和装饰诗句未转录。", move, "review-note"),
    ]

    summer = curated_section("“饮”领夏日，关怀满载：新亦源夏日消暑行动", 8, None, summer_opening, [
        block("◎ 文／陈燕", summer_opening, "quote"),
        block("随着夏日的热浪席卷而来，高温仿佛在每一个角落蔓延。为了缓解炎热给员工带来的不适，公司特别准备了一系列的消暑饮品，让每一位在仓库中辛勤工作的员工都能感受到来自大家庭的关怀与凉爽。", summer_opening),
        block("在这个夏天，我们不仅仅是在传递货物，更是在传递一份温馨的关爱。从冰镇西瓜到清凉绿豆糖水，从甜蜜的小冰棍到解渴的冰可乐，每一款饮品都是我们对员工辛勤劳动的深深敬意和贴心呵护。", summer_close),
        block("一直坚持“以人为本”的企业文化，我们深知，员工是公司最宝贵的财富。在酷暑中，我们希望这些小小的举措能为员工带去一丝丝凉意，让他们在辛勤工作之余，也能感受到公司如家一般的温暖。", summer_close),
        block("PDF physical page 8 右上、左下为夏日消暑文章的印刷第 23–24 页；仓内活动照片未转录。", summer_close, "review-note"),
    ])
    sale_article = curated_section("618特辑：时尚背后的力量 服装云仓揭秘", 8, None, sale, [
        block("◎ 文／陈燕", sale, "quote"),
        block("每年的 618 电商大促，都是一场消费者的购物盛宴。在这长达一个月的购物狂欢背后，是无数商家和服务提供者的辛勤付出和精心策划。其中，我们公司作为一家专业的服装云仓，为这场电商盛宴提供了强有力的后勤支持。", sale),
        block("在这个特殊的时期，我们为了确保每一件商品都能安全、准时地送达消费者手中，无论是在商品入库、存储、出库，还是在物流配送、退货处理等环节，我们都更为严格把控，力求做到最好。", sale),
        block("其中我们的退货质检服务是我们的一大亮点。对于消费者退回的退货，我们会进行严格的质检，确保退回的商品符合要求后完成二次上架。这样既能保障消费者的权益，也能为商家节省大量的成本和时间。", sale),
        block("（详细介绍见上一期期刊：把专业做到极致：新亦源鞋服云仓质检服务介绍）", sale),
        block("今年的 618 电商大促活动虽然战线拉长，但我们新亦源服装云仓始终坚守在后勤一线，为各大服装品牌提供全方位的支持，让他们能够更加专注于商品的销售和推广，为消费者带来更好的购物体验。", sale),
        block("在未来的日子里，我们将继续努力，为时尚行业的发展贡献自己的力量！", sale),
        block("PDF physical page 8 右下为 618 特辑的印刷第 25 页；仓内照片未转录。", sale, "review-note"),
    ])
    index = next(index for index, section in enumerate(sections) if section["title"] == "夏日消暑行动与 618 特辑")
    sections[index:index + 1] = [summer, sale_article]


def curate_issue_ten_opening(sections: list[dict]) -> None:
    """Replace only the two printed source articles whose PSM3 blocks mingle screenshots.

    These paragraphs were transcribed from the 600-dpi local renders of PDF
    physical pages 3–5.  They are retained as original article wording, not a
    synopsis; image/screenshot-only areas remain bounded review notes.
    """
    def block(text: str, page: int, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(10, page, None, "full", bbox)}

    # The A4 PDF embeds two printed pages in each half.  These bounds identify
    # the printed-page *body* that contains a transcription; they deliberately
    # do not pretend the manually verified prose has one OCR-line-sized box.
    story_left = [95, 410, 300, 780]
    story_right = [295, 410, 510, 780]
    gmv_p6 = [95, 35, 300, 400]
    gmv_p7 = [295, 35, 510, 400]
    gmv_p8 = [95, 405, 300, 780]
    gmv_p9 = [295, 405, 510, 780]
    gmv_p10 = [95, 35, 300, 400]
    gmv_p11 = [295, 35, 510, 400]
    gmv_p13 = [295, 405, 510, 780]

    opening = curated_section("我们的故事", 3, None, [70, 420, 525, 795], [
        block("◎ 文／尹姜英", 3, story_left, "quote"),
        block("回首与新亦源共同成长的七年，往事如电影片段在脑海中闪过，其中有欢笑，有忧愁，更有感动。在此，我想讲述新亦源两次生死攸关的经历。", 3, story_left),
        block("2017 年，新亦源在争议中创立，5 位创始人怀着“一群人、一条心、干好一件事”的信念开启创业之旅。在王总的引领下，公司定位服装物流赛道，可起初并无服装客户。恰在此时，LX 公开招标，如黑暗中的曙光。经三轮竞标，新亦源拿下广东、广西两省运输标。", 3, story_left),
        block("公司初创，困难重重。无车队、无成熟运营团队，且中标广东至江苏线路。有三个月试用期，若质量不达标随时可能出局，这将使公司名誉受损。于是，我们与 QF 快递达成合作，借助其干线网络和场地，自建末端配送资源，以广东为试点打造商圈配送网络，半个月后商圈事业部成立。项目启动一周后，问题涌现。干线车辆以 QF 自营货物为主，无法保障货物及时发运，时效无保障；回单寄遗失，数据不能及时反馈客服，信息失控。", 3, story_left),
        block("各门店投诉不断，客服团队疲于应对。我们带领总部项目客服赶到现场，奋战三个通宵梳理数据。经此，我们意识到配送资源需自己掌控，新亦源广东配送网络形成，首次危机解除。", 3, story_right),
        block("两个月后，又现危机。竞争对手因我们中山、珠海线路时效问题准备接手 LX 项目。我们连夜商讨方案、整理数据，最终，客户被我们打动，给我们一个月时间。我们不负所望，一周内解决问题，之后与 LX 合作期间每年获评优秀供应商，还凭借口碑接入几十个服装品牌。", 3, story_right),
        block("至此，新亦源实现从服装商贸物流到服装仓配一体化的转型，拥有 1300 人的团队、全国近 50 万平方米仓储面积和近百个国内外服装品牌入驻。", 3, story_right),
        block("七年，有惊心动魄，有温暖感人，有失败后的坚持，更有坚守初心的信念。我们感恩客户，感激团队，感谢自己。相信在天时地利人和下，新亦源能走得更远、更高，成为服装行业物流变革的引领者。", 3, story_right),
        block("PDF physical page 3 下半为原刊印刷页 4/5；保留正文的 source bbox 定位至对应印刷页正文区域（非逐行框）。人物合影和页角装饰未转录；DSLR 段落中有局部小字被图案遮挡，未补写。", 3, [70, 420, 525, 795], "review-note"),
    ])
    gmv = curated_section("单场 GMV 破亿，轻奢极简风女装在直播间爆发", 4, None, [75, 35, 525, 790], [
        block("◎ 文摘自：公众号-降噪 NoNoise，作者戴菁", 4, gmv_p6, "quote"),
        block("女装行业没有秘密。无论是一个流行元素、一个爆款版型，还是一个爆红品牌，信息的流动和拆解永远是即时性的。比如最近一年，一个走轻奢极简风的红人店铺 COCO ZONE 快速成为女装圈的研究对象，以及各类拆解短视频的主角。", 4, gmv_p6),
        block("圈外人可能听都没听过这个品牌名，圈内人却已经忙着拆解 COCO ZONE 的增长神话。一个名不见经传的主播，动辄四五百元的衣服，单场直播能卖出上亿 GMV、全年销售额高达 50 亿，连续霸榜抖音女装销售额第一——这在消息灵通的女装电商群体中，很难不引起关注。", 4, gmv_p6),
        block("在亿万服装行业中，女装向来属于空间最大、竞争最激烈的类目。一波时尚潮流，可以捧红一批品牌；一批库存，又可能惩罚另一波误判趋势的商家。而每一波新涌现出来的平台红利，亦有可能重塑整个行业格局。", 4, gmv_p6),
        block("在这一过程中，什么类型的女装商家能够实现稳定而长久的经营，是行业共同关注的命题。作为业内最大黑马，COCO ZONE 及其所代表的中高端女装商家，能否给行业带来新的启示？这是我们颇感兴趣的地方。", 4, gmv_p6),
        block("2023 年 2 月，在一件售价 599 元的城市冲锋衣被买成爆品后，抖音女装商家开始纷纷打听，谁是刘一一？COCO ZONE 是什么来头？", 4, gmv_p6),
        block("这款名为 COCO ZONE 的冲锋衣，出现在腰部达人刘一一的直播间。衣服男女同款，黑白灰三个颜色，设计风格既适合城市通勤，满足户外运动场景需求，兼具极简审美与实用性。", 4, gmv_p6),
        block("用户群体才是直播间的基本盘，但 COCO ZONE 这个新品牌，自从上线便走高品质、中高价格段路线，而且销量越卖越高，去年 GMV 超过 50 亿元。", 4, gmv_p7),
        block("关键是这一增长势头延续至今：今年 618 期间，COCO ZONE 的 GMV 达到 4.5 亿；巅峰时刻，刘一一直播间 1 分钟成交 40 万元、1 小时 1600 万元。", 4, gmv_p7),
        block("仅从粉丝量来看，COCO ZONE 的体量并不在超头部行列，因为后者动辄有五六百万粉丝。而 COCO ZONE 作为与达人 IP 强绑定品牌，作为创始人之一的带货主播刘一一，3 个同名账号矩阵中粉丝量最大的 @刘一一，只有 140 万粉丝；其次是 @刘 11 生活号，92 万；@Bella 刘一一，30 万。", 4, gmv_p7),
        block("在同行的拆解中，COCO ZONE 的崛起被归因为达人 IP 风格差异化＋货盘＋运营能力。站在品牌运作的视角，多名业内人士评价 COCO ZONE“没有明显短板”。", 4, gmv_p9),
        block("从直播风格来看，刘一一直播间没有喧嚣的“123 上链接”“姐妹们冲”，她的个人风格更接近小红书博主的慢直播，一个人坐在沙发上，或者蹲在地上，以轻柔的聊天方式介绍货品、材质、穿搭理念，也会跟粉丝分享生活近况和个人感悟。", 4, gmv_p9),
        block("从服装风格来看，COCO ZONE 走极简风，时装颜色以低饱和度的黑白灰棕为主，既日常百搭，又能突显高级感。款式以女性基础款为主，但又不像被 MUJI 发挥到极致的寡淡性冷淡风，更偏向时尚大牌的设计剪裁，追求一个简约和大方。", 4, gmv_p8),
        block("当然有个“好观众缘”只是第一步。在直播电商中，真正让达人和品牌拉开差距的，还是后端的货盘和服务能力。电商平台都吃货盘，只是直播电商平台尤甚，但货盘对后端供应链的要求极高。", 5, gmv_p10),
        block("“做这个品牌之前，我们已经就是准备好的状态。”COCO ZONE 创始人之一、负责供应链的“建哥”透露，他本人在广州服装行业积累十多年，此前一直为国内一二线品牌做产品研发设计类供应链服务，并由此积累了大量设计师和工厂资源。", 5, gmv_p10),
        block("不少同行在拆解 COCO ZONE 的货盘数据时，都感慨品牌的上新速度和爆品能力。COCO ZONE 目前共有 6 个直播间，每场直播大概都会有二三十个新款。建哥透露，除了公司内部的设计师团队，品牌还有 4 个外部研发设计小组，大概六十多人，这些人负责源源不断的创意输出，平均每天能提供 30—50 个新品设计方案，供直播间选择。", 5, gmv_p10),
        block("COCO ZONE 用户画像为 30—50 岁的高消费能力女性，如精英白领、中产妈妈。这些人买衣服，不仅要版型好看，对品质也有更高的要求。尤其是高客单价服饰，品质往往决定复购率。而 COCO ZONE 从最初定位就在对标线下大牌，目标是在同等品质的前提下，做到比线下更具“性价比”。", 5, gmv_p11),
        block("为了保证消费者的购物体验，COCO ZONE 全部采用顺丰发货，且每件服装出库前都要进行人工全检，以确保消费者收到的衣服没有线头及其他瑕疵，而目前行业内通行的是人工抽检、机器混检。", 5, gmv_p11),
        block("当前直播电商行业已经进入下半场，平台流量、直播间氛围、消费者购物心理都在微妙变化。什么类型的商家能够脱颖而出、实现更为长久的经营？细究下来，我们认为各行各业还是有最大公约数的——比如好内容和好产品的强强联合。具备这个底层优势的商家，亦有可能跑出下一个 COCO ZONE。", 5, gmv_p13),
        block("PDF physical page 4—5 为原刊印刷页 6—13；保留正文的 source bbox 定位至对应印刷页正文区域（非逐行框）。直播截图、商品卡和图内小字未转录；保留的段落均逐段对照 600 dpi 本地渲染图。", 4, [75, 35, 525, 790], "review-note"),
    ])
    sections[0:2] = [opening, gmv]


def curate_issue_ten_page_nine(sections: list[dict]) -> None:
    """physical p9 has three articles, not one interleaved four-page OCR stream."""
    def block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(10, 9, None, "full", bbox)}

    top_left, top_right = [95, 35, 300, 400], [295, 35, 510, 400]
    bottom_left, bottom_right = [95, 405, 300, 780], [295, 405, 510, 780]
    efficiency = curated_section("人效通升级：全面实现面试登记无纸化", 9, None, top_left, [
        block("◎ 文／陈燕", top_left, "quote"),
        block("新亦源一直是追求高效率和坚守环保理念的公司，近日，我司对自主研发的人效通系统——员工管理系统，进行进一步的优化与升级，引入了面试二维码扫码登记功能。这一创新举措允许面试者通过简单扫描二维码即可完成信息登记，不仅简化了面试流程，还实现了面试登记的无纸化，为求职者提供了更加便捷的面试体验。", top_left),
        block("人效通自 2022 年研发以来，一直致力于引领和推动企业数字化浪潮的发展。", top_left),
        block("这项技术的应用，标志着我公司在人力资源管理方面迈出了重要一步。过去，面试者需要手动填写纸质面试表格，耗时且效率低。现在，通过一次扫码，面试者的信息便可被系统自动记录，未来入职时也无需重复填写，大大节省了时间和资源。", top_left),
        block("人效通的升级不仅提升了面试效率，同时也是我司对环境保护的承诺。无纸化操作减少了纸张的使用，有助于减轻对环境的压力。同时，这也体现了公司对于科技运用的前瞻性思维，以及对提升员工和潜在员工体验的重视。", top_left),
        block("我司将持续探索和实施新技术，不断完善员工管理和招聘流程，致力于打造一个高效、环保、且员工友好的工作环境。", top_left),
    ])
    safety = curated_section("员工之声：打工人，你的上下班安全谁来守护？", 9, None, top_right, [
        block("◎ 文／陈燕", top_right, "quote"),
        block("最近，或因天气原因，各地接二连三地发生安全事故。目前，大连一父亲送女儿上班双双溺亡事件已过去一周，却依然让人心有余悸。", top_right),
        block("作为社会的辛勤工作者，我们每天都要经历上下班的路程，而这看似平常的过程却隐藏着各种风险。那么，我们该如何提高自己的安全意识，确保每一次出行都能平安顺利呢？", top_right),
        block("01 选择合适的交通工具", top_right, "subheading"),
        block("根据路线和交通状况选择最安全的出行方式。避免在极端天气或者身体状况不佳时驾驶。", top_right),
        block("02 遵守交通规则", top_right, "subheading"),
        block("无论是步行、骑行还是开车，都要严格遵守交通规则。不闯红灯、不逆行、不疲劳驾驶，稳定情绪，保持清醒的判断力。", top_right),
        block("03 规划时间充足", top_right, "subheading"),
        block("预留出足够的时间出门，避免因为赶时间而导致的超速驾驶或者疏忽大意。", top_right),
        block("04 了解天气情况", top_right, "subheading"),
        block("出行前关注天气预报，遇到恶劣天气时要格外小心谨慎，必要时选择推迟出行。", top_right),
        block("05 学习自救知识", top_right, "subheading"),
        block("掌握一些基本的自救和急救知识，能够在面对突发情况时保持冷静，采取正确的自救方法。", top_right),
    ])
    service = curated_section("专业专注·质敬客户：服务效率提升背后的举措与成果", 9, None, bottom_left, [
        block("◎ 文／温俊衡", bottom_left, "quote"),
        block("今年，我们将“质敬客户”作为行动指南，深入梳理和评估仓库各环节人员的效能目标。根据客户、品类以及项目类型的差异，精心制定了与之对应的效率目标，全力满足客户与市场的需求，至今已实施近半年。此刻，让我们通过具体举措和成效来回顾这一过程，为后续的培训提升提供有力依据。", bottom_left),
        block("重庆仓", bottom_left, "subheading"),
        block("入库模块（收货、上架、拣货）：通过优化操作流程、加强员工培训以及合理调配资源等措施，实际产能相比目标产能有了显著提升，员工操作更加熟练，工作效率提高明显。", bottom_left),
        block("出库模块（发货、覆盖 B2C、B2B、JITX）：在优化发货流程、提高设备利用率以及加强团队协作等方面发力，实际产能接近目标产能且略有超出，各环节协同配合更加顺畅，有效保障了出库效率。", bottom_left),
        block("客退模块：采取了改进客退处理流程、加强与客户沟通以及提升员工处理问题的能力等手段，实际产能超出目标产能一定幅度，客退处理更加高效，客户满意度得到提升。", bottom_left),
        block("质检模块：由于客户需求的变化，内部持续调整操作流程，但仍面临一些挑战，实际产能距离目标产能尚有差距。后续将进一步优化流程，加强员工培训，以提高质检效率。", bottom_left),
        block("湖北仓", bottom_right, "subheading"),
        block("入库模块（装卸、上架、退货）：通过合理安排人员分工、优化装卸设备的使用以及加强退货管理等措施，实际产能超出目标产能，取得了较好的效果。", bottom_right),
        block("出库模块（拣货、车标、核单以及发货）：在优化拣货路径、提高车标准确性、加强核单效率以及提升发货速度等方面进行改进，实际产能略高于目标产能。", bottom_right),
        block("质检模块：通过加强质检标准的培训、优化质检流程以及提高质检设备的精度等措施，实际产能接近目标产能且稍有超出。", bottom_right),
        block("PDF physical page 9 下半为服务效率文章的重庆仓、湖北仓正文区域；图示及未核清的小字未转录。", bottom_left, "review-note"),
    ])
    index = next(index for index, section in enumerate(sections) if section["title"] == "人效通升级与员工之声")
    sections[index:index + 1] = [efficiency, safety, service]


def curate_issue_ten_page_ten(sections: list[dict]) -> None:
    """Continue p9's service article, then keep p31/32 as its own article.

    The last A4 render contains printed p30 (service metrics), p31 and p32
    (the referral article), and a decorative p33.  It is not one article.
    """
    service_top_left = [95, 35, 300, 400]
    referral_top_right = [295, 35, 510, 400]
    referral_bottom_left = [95, 405, 300, 780]

    def block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(10, 10, None, "full", bbox)}

    service = next(section for section in sections if section["title"] == "专业专注·质敬客户：服务效率提升背后的举措与成果")
    service["blocks"] = [
        block for block in service["blocks"] if block["type"] != "review-note"
    ] + [
        block("东莞电商仓", service_top_left, "subheading"),
        block("一、桥头、朗州仓", service_top_left, "subheading"),
        block("入库模块（收货、上架、拣货）：通过引入先进的收货设备、优化上架流程以及提高拣货准确性等措施，实际产能接近目标产能。", service_top_left),
        block("出库模块（B2C、B2B 发货）：采取优化订单处理流程、增加发货通道以及加强物流管理等手段，实际产能超出目标产能较多。", service_top_left),
        block("质检模块（新品、退货拆包质检）：通过加强质检人员培训、完善质检标准以及改进质检设备等措施，实际产能接近目标产能且稍有超出。", service_top_left),
        block("东莞桥头、朗州仓整体目标产能的达成率与预期目标没有显著差异，各模块环节的达成率幅度存在偏差。", service_top_left),
        block("番禺仓", service_top_left, "subheading"),
        block("入库模块（收货、上架、拣货）：通过优化收货流程、合理安排上架时间以及提高拣货效率等措施，实际产能超出目标产能一定比例。", service_top_left),
        block("PDF physical page 10 左上为服务效率文章的东莞电商仓续页；图形背景覆盖处未逐字转录。", service_top_left, "review-note"),
    ]
    referral = curated_section("内推大作战：抓住创“薪”机会", 10, None, referral_top_right, [
        block("◎ 文／陈燕", referral_top_right, "quote"),
        block("2024 年已过大半，在这个充满机遇与挑战的季节，我们番禺仓的内推活动重磅来袭！", referral_top_right),
        block("01 为什么参加内推", referral_top_right, "subheading"),
        block("在这里，你不仅能为朋友、前同事牵线搭桥，找到一个理想的职业发展平台，还能为公司注入新的活力和智慧。更重要的是，还有丰厚的奖励等你来拿！", referral_top_right),
        block("02 内推奖励方案", referral_top_right, "subheading"),
        block("凡介绍对象经过面试合格被录用，通过试用期且在公司工作满 3 个月以上的（期间请假不得超过 10 天），公司给予介绍人按人头 500 元／人的奖励。", referral_top_right),
        block("奖励发放形式：在职满 1 个月，在次月薪资中发放 100 元；在职满 2 个月，在次月薪资中发放 150 元；在职满 3 个月，在次月薪资中发放 250 元。", referral_top_right),
        block("03 内推流程＆方式", referral_bottom_left, "subheading"),
        block("①介绍人扫码内推专页登记内推信息；②HR 安排面试；③应聘者面试通过；④应聘者办理入职手续；⑤定期核发内推奖金。", referral_bottom_left),
        block("04 当前热招职位", referral_bottom_left, "subheading"),
        block("我们是一家专业的鞋服云仓公司。在当下竞争激烈的市场环境中，我们公司始终保持着蓬勃的发展势头，与众多知名企业建立了长期稳定的合作关系。赶紧行动起来，把身边的优秀人才推荐给我们吧！让我们一起携手共进，共创美好未来！", referral_bottom_left),
        block("PDF physical page 10 右上、左下为内推文章的可读正文；二维码、职位卡片和刊末联系方式未转录。", referral_bottom_left, "review-note"),
    ])
    index = next(index for index, section in enumerate(sections) if section["title"] == "仓储服务效率与内推大作战")
    sections[index:index + 1] = [referral]


def curate_issue_twelve_quality(sections: list[dict]) -> None:
    """Keep the two source-verified quality-research pages as source prose.

    The blue panels on physical p12/right and p13/left are readable in the
    local source renders.  The generic OCR cleaner used to remove most of
    them because the white panel text was interleaved with its illustration.
    This bounded transcription retains only what is visible on those panels;
    the six-row defect table remains a small source crop rather than made-up
    cell text.
    """
    p12_right = [660, 92, 1150, 790]
    # PDF point coordinates, checked against physical p13/left at 200 dpi:
    # x=55 includes the left edge of the blue panel and all row labels; y=242
    # ends in the clear gap below the sixth row and before “2.功能性服装质检”.
    p13_left = [55, 65, 560, 785]
    table_rect = [55, 95, 520, 242]

    def block(text: str, source_bbox: list[float], kind: str = "paragraph") -> dict:
        page = 12 if source_bbox == p12_right else 13
        side = "right" if page == 12 else "left"
        printed = 21 if page == 12 else 22
        return {"type": kind, "text": text, "source": direct_source(12, page, printed, side, source_bbox)}

    doc = pymupdf.open(PDF_ROOT / "12.pdf")
    output = IMAGE_ROOT / "12" / "quality-defect-table.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    pix = doc[12].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=pymupdf.Rect(table_rect), alpha=False)
    pix.save(output)
    table_source = direct_source(12, 13, 22, "left", table_rect)

    quality = curated_section("服装质检研究方向总结", 12, 21, [661.4, 107.3, 899.7, 139.7], [
        block("◎ 文／耿涛", p12_right, "quote"),
        block("一、传统服装质检技术与方法研究", p12_right, "subheading"),
        block("1.服装品质控制体系与QC小组活动", p12_right, "subheading"),
        block("《论品质控制对服装销售管理的意义》：分析QC（质量控制）小组在服装销售前的核心作用，强调标准化操作、员工质量意识培养及面料预检（如面料起皱污渍破洞等分析），提出通过QC团队实现“销售前质量闭环管理”。", p12_right),
        block("应用案例：肇庆四会仓通过QC管理提升质检拦截率，降低返工成本；广州黄埔仓通过QC管理提升质检深度，降低客诉；东莞智谷仓通过QC管理提升标准化流程，降低退货率；华东地区通过QC管理提升各品类质检手势及效能，降低用工成本。", p12_right),
        block("2.牛仔品类专项质检研究", p12_right, "subheading"),
        block("《牛仔品类质量检验》：从面料性能（耐磨性、洗水工艺）、版型设计（贴身／宽松款结构合理性）、工艺细节（缝线牢固度、线迹均匀性）及辅料（纽扣、拉链）多维度构建检验框架，提出“试模服帖法”验证舒适性。", p12_right),
        block("二、智能化质检技术研究", p12_right, "subheading"),
        block("1.机器视觉与质检监控设备", p12_right, "subheading"),
        block("“智能视觉共享实验室”（肇庆四会仓）投放交叉带分拣机：直发命中（商品直接复核打包出库）；拦截命中（退货需拦截商品）；混储命中（商品SKU量小满足混储条件）；散件命中（商品SKU量大满足一品一位条件）；手工波次（通过在主控电脑上导入手工报表开启）。", p12_right),
        block("2.监控技术在作业场景中鉴别溯源应用", p12_right, "subheading"),
        block("采用USB+NAS方案精准鉴别质检小组作业场景，（监控作业手法是否规范标准，溯源不合格订单第一责任人）。", p12_right),
        block("三、专项质量问题的研究", p13_left, "subheading"),
        {"type": "figure", "src": "/images/supply-chain-whitepapers/12/quality-defect-table.png", "alt": "服装质检研究中的类型与质量问题六行表", "caption": "原刊印刷第 22 页“专项质量问题的研究”表格", "width": pix.width, "height": pix.height, "source": table_source},
        block("PDF physical page 13 左侧 bbox [55, 95, 520, 242] 为“类型／质量问题”六行表格；为避免把单元格或图形边线误作正文，保留局部原图供核验。", table_rect, "review-note"),
        block("2.功能性服装质检", p13_left, "subheading"),
        block("服装作为日常穿着用品，其功能性至关重要，好的功能性检测能确保产品质量，提升消费者满意度，同时也有助于树立品牌形象。划分“功能款”（抗菌、防水）与“品质款”等级，要求安全性能（甲醛含量）、服用性能（起球率）、舒适性（透气度）、附件使用顺畅（拉链-纽扣-魔术贴）等几类指标升级。", p13_left),
        block("四、行业标准与质量管理体系研究", p13_left, "subheading"),
        block("1.标准化与质检红线推动", p13_left, "subheading"),
        block("质检小组针对服装标签制定了标准化流水质检步骤。销退质检步骤：一闻气味、二核三唛、三掏口袋、四查外观、五翻内里、六检配件、七标准叠、八规范包。新品大货质检步骤：一对样衣、二核三唛、三称克重、四查外观、五量尺寸、六套人台、七标准叠、八规范包。", p13_left),
        block("为了建立规范、长效的流程标准，制定相关质检“红线”：红线一：错款错码；红线二：刺鼻的异味；红线三：衣服存在血迹；红线四：用错包装耗材；红线五：口袋有异物；红线六：人为次品。", p13_left),
        block("五、研究趋势与发展方向", p13_left, "subheading"),
        block("1.技术融合深化：5G+工业互联网实现“数据驱动质检”，如全面实施系统化质检。2.标准体系完善：现行标准矛盾修订（如流水质检标准的适配性问题）。3.质检增值业务扩展：部分项目实施设定增值服务（例如：改标-车标-熨烫-基础清污）。", p13_left),
    ], side="right")
    index = next(index for index, section in enumerate(sections) if section["title"] == "服装质检研究方向总结")
    sections[index] = quality


def curate_issue_twelve_activities(sections: list[dict]) -> None:
    """Restore the two legible physical-p15 activity articles without OCR fragments."""
    water = [65, 100, 550, 480]
    dragon = [660, 90, 1150, 780]
    dragon_continuation = [65, 85, 550, 780]

    def block(text: str, page: int, printed: int, side: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(12, page, printed, side, bbox)}

    water_article = curated_section("步履云端第一期：水声水库首站全纪实", 15, 26, water, [
        block("◎ 文／陈燕", 15, 26, "left", water, "quote"),
        block("6 月 16 日，「步履云端」系列行动在黄埔水声水库写下序章——没有海拔的攀登，恰是云仓最贴地的飞行。", 15, 26, "left", water),
        block("这是一场由新亦源总经理王伟先生发起的服务哲学实验：", 15, 26, "left", water),
        block("“优质的服装云仓服务，它应如水流向低处——沉到每个仓库里，沉进客户动线里，沉入大地肌理中。”", 15, 26, "left", water, "quote"),
        block("系列信条：", 15, 26, "left", water, "subheading"),
        block("① 服务没有绝对高度，只有覆盖密度；② 最优路径在鞋底磨痕里；③ 团队共振是最高效的服务器。", 15, 26, "left", water),
        block("在客户看不见的库房深处，有我们勇往直前的步履。服务本应如此——俯身时听见大地心跳，抬头便见整片云端。", 15, 26, "left", water),
        block("PDF physical page 15 左侧的照片与装饰图形未转录；以上为该页左栏清晰正文。", 15, 26, "left", water, "review-note"),
    ], side="left")
    dragon_article = curated_section("粽情端午，暖心相伴", 15, 27, dragon, [
        block("◎ 文／陈燕", 15, 27, "right", dragon, "quote"),
        block("粽叶飘香，端午将至。为感谢全体员工的辛勤付出，公司为各分仓的小伙伴们精心准备了端午暖心小福利，让每一位员工都能感受到公司的关怀与节日的温暖。", 15, 27, "right", dragon),
        block("PDF physical page 15 右侧六张照片的标签为总部、肇庆仓、智谷仓、朗州仓、禾观仓、佛山仓；照片内其余文字未转录。", 15, 27, "right", dragon, "review-note"),
        block("粽香传情，心意相连。新亦源云仓再次祝愿大家端午安康，阖家幸福！未来，我们继续携手，共赴美好！", 16, 28, "left", dragon_continuation),
        block("PDF physical page 16 左侧为端午照片续页；番禺仓、湖北仓、黄埔仓、花桥仓、汇金仓、合肥仓标签均在图片内，未作为连续正文转录。", 16, 28, "left", dragon_continuation, "review-note"),
    ], side="right")
    replacements = {
        water_article["title"]: water_article,
        dragon_article["title"]: dragon_article,
    }
    for index, section in enumerate(sections):
        if section["title"] in replacements:
            sections[index] = replacements[section["title"]]


def curate_issue_twelve_known_retest_regions(sections: list[dict]) -> None:
    """Repair only Luna's p10/p11/p14/p17/p18 source-confirmed findings."""
    logistics = next(section for section in sections if section["title"] == "2025 年 1–5 月中国物流运行分析")
    revised_logistics = []
    for block in logistics["blocks"]:
        text = block.get("text", "")
        if text in {"并车本千", "体平稳结级力质效"}:
            # Vertical cover lettering, not article prose.
            continue
        if text.startswith("Ft: 5 月民航货邮运输量"):
            revised_logistics.append({
                **block,
                "text": "5 月民航货邮运输量同比增长 16.6%，高于货运量增长 12.3 个百分点，国际航空货运能力持续增强，仍保持 26.3% 的高速增长。二是大宗货物运输转型深化，国家铁路货运周转时效缩短，运输效率提高 1.0%。中欧班列 5 月份开行 1688 列，同比下降 2%，中亚班列开行",
            })
            continue
        revised_logistics.append(block)
    logistics["blocks"] = revised_logistics

    anniversary = next(section for section in sections if section["title"] == "初心八载同欢庆，匠心织新共此时")
    card_region = [680, 105, 1140, 750]
    anniversary["blocks"] = [
        block for block in anniversary["blocks"]
        if block.get("text") not in {
            "“ 初心八载， 匠心织新 !", "干册竞发再攀登。 上海他 wa Sh", "视新亦源八周岁生日忆",
            "2, “我们愿伴随着时光的于“在这秤旧迎新的时刻， 不步陪伴新亦源走过每个春夏秋",
            "层楼， 团队和谐， 创新不断。”",
        }
    ]
    anniversary["blocks"].append({
        "type": "quote",
        "text": "“八度春秋织锦绣，千帆竞发再攀登。上海仓祝新亦源八周年生日快乐！”",
        "source": direct_source(12, 14, 25, "right", card_region),
    })
    anniversary["blocks"].append({
        "type": "review-note",
        "text": "PDF physical page 14 右侧 bbox [680, 105, 1140, 750] 为周年祝福卡片区域；已恢复清晰上海仓祝福，其余卡片文字不逐条转录。",
        "source": direct_source(12, 14, 25, "right", card_region),
    })

    competition_left = [65, 100, 550, 760]
    competition_right = [660, 90, 905, 750]
    def competition_block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        side = "left" if bbox == competition_left else "right"
        printed = 30 if side == "left" else 31
        return {"type": kind, "text": text, "source": direct_source(12, 17, printed, side, bbox)}

    competition = curated_section("以赛促学，以劳为荣：看新亦源云仓如何“卷”出专业力", 17, 30, competition_left, [
        competition_block("◎ 文／陈燕", competition_left, "quote"),
        competition_block("劳动，是耕耘，更是成长。", competition_left),
        competition_block("在这个属于每一位奋斗者的节日里，我们想讲述一群“看不见”的服装守护者——他们不直接面对消费者，却用精准的分拣、高效的调度、严谨的品控，让每一件服装更快、更准地抵达千家万户。", competition_left),
        competition_block("他们，新亦源人。", competition_left),
        competition_block("五一劳动节前夕，新亦源肇庆仓开展了 2025 年第一季度技能竞赛，当中诠释了什么是真正的“专业力”——不是被动完成任务，而是不断突破极限，让服务更高效、更可靠。", competition_left),
        competition_block("经过激烈角逐，以下伙伴凭借过硬的专业技能脱颖而出，让我们用最热烈的掌声祝贺这些优秀的伙伴！他们的表现完美诠释了什么是“工匠精神”——在重复中追求极致，在平凡中创造不凡。", competition_right),
        competition_block("同时我们也期待更多的伙伴再接再厉，在下一次的技能竞赛中崭露头角！每一次的比拼都是新的起点，每一次的练习都在为更好的服务蓄力。相信在新亦源这个大家庭里，每个人都能找到属于自己的舞台，用专业和汗水书写属于自己的成长故事。", competition_right),
        competition_block("PDF physical page 17 右侧的获奖名单、照片及奖金表为图表区域，未转录为连续正文。", competition_right, "review-note"),
    ], side="left")

    huaqiao_left = [65, 95, 560, 760]
    huaqiao_right_top = [660, 90, 1145, 350]
    huaqiao_right_bottom = [900, 410, 1145, 760]
    def huaqiao_block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        side = "left" if bbox is huaqiao_left else "right"
        return {"type": kind, "text": text, "source": direct_source(12, 18, 32 if side == "left" else 33, side, bbox)}

    huaqiao = curated_section("温情汇聚，共谱花桥仓发展新篇——昆山花桥仓员工关怀活动纪实", 18, 32, huaqiao_left, [
        huaqiao_block("◎ 文／陈燕", huaqiao_left, "quote"),
        huaqiao_block("在企业发展的征程中，员工是最宝贵的财富。为进一步提升员工的归属感与工作积极性，增强团队凝聚力，近日，昆山花桥仓精心策划并举办了员工慰问活动及新员工座谈会，以实际行动传递公司对员工的关怀与重视。", huaqiao_left),
        huaqiao_block("感恩相伴，员工慰问暖人心扉", huaqiao_left, "subheading"),
        huaqiao_block("当日下午 15：00，员工慰问活动在花桥仓晨会区准时拉开帷幕。活动现场气氛热烈而温馨，轻松的音乐为活动营造了愉悦的氛围。", huaqiao_left),
        huaqiao_block("活动伊始，领导暖心致辞，肯定大家的付出，描绘美好未来，为我们注入前行的力量。内推机制宣导，让大家轻松了解如何成为“伯乐”，为公司揽才的同时收获丰厚奖励。“员工之声”与“管理开放日”宣导环节则为我们搭建起与公司沟通的桥梁。游戏环节更是欢乐不断！接力球、马兰开花，团队协作中，欢笑声此起彼伏。", huaqiao_left),
        huaqiao_block("倾听心声，新员工座谈会助力成长", huaqiao_right_bottom, "subheading"),
        huaqiao_block("活动当天，新员工座谈会在三楼员工休息区如期举行。本次座谈会旨在帮助新入职的员工更好地融入公司大家庭，快速适应工作环境。", huaqiao_right_bottom),
        huaqiao_block("在心声分享环节，新员工们纷纷敞开心扉，分享自己入职以来的感受。有的新员工讲述了在工作中得到同事帮助、顺利融入团队的温暖经历；有的则提出了在工作中遇到的挑战和困惑。公司管理层认真倾听每一位新员工的发言，并给予了积极的回应和建议。", huaqiao_right_bottom),
        huaqiao_block("活动的最后，新员工们在小纸条上写下了自己对未来在公司工作与成长的期望和目标，并投入“时光信箱”。这些承载着新员工梦想与憧憬的纸条，将被公司妥善保存，见证他们在公司的成长与进步。", huaqiao_right_bottom),
        huaqiao_block("关怀凝聚力量，携手共创未来", huaqiao_right_top, "subheading"),
        huaqiao_block("此次员工慰问活动及新员工座谈会的成功举办，充分体现了公司对员工的关怀与重视。通过这些活动，不仅让员工们感受到了公司的温暖与关爱，增强了员工的归属感和忠诚度，同时也为新老员工之间搭建了沟通交流的平台，促进了团队的融合与协作。", huaqiao_right_top),
        huaqiao_block("在未来的日子里，昆山花桥仓将继续秉承“以人为本”的理念，不断丰富员工关怀活动的形式和内容，为员工创造更加良好的工作和发展环境。相信在全体员工的共同努力下，昆山花桥仓必将迎来更加辉煌的明天！", huaqiao_right_top),
        huaqiao_block("PDF physical page 18 的照片、装饰英文和图片水印未转录；正文按引言、慰问、座谈、总结的原文逻辑排序。", huaqiao_right_top, "review-note"),
    ], side="left")
    replacements = {competition["title"]: competition, huaqiao["title"]: huaqiao}
    for index, section in enumerate(sections):
        if section["title"] in replacements:
            sections[index] = replacements[section["title"]]


def curate_issue_seven_recruitment_posters(sections: list[dict]) -> None:
    """Keep p29's two readable job posters as separate historical source images."""
    title = "“薪”动招募：新亦源大家庭欢迎你"
    poster_rects = [
        ([665, 110, 895, 660], "foshan-warehouse-recruitment-poster.png", "佛山仓招聘海报：质检员（对成品服装进行质量检查）"),
        ([915, 110, 1145, 660], "qiaotou-warehouse-recruitment-poster.png", "东莞桥头仓招聘海报：操作员（电商仓储备货、发货、打包等）"),
    ]
    doc = pymupdf.open(PDF_ROOT / "7.pdf")
    directory = IMAGE_ROOT / "7"
    directory.mkdir(parents=True, exist_ok=True)
    figures = []
    for rect_values, filename, alt in poster_rects:
        pix = doc[15].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=pymupdf.Rect(rect_values), alpha=False)
        pix.save(directory / filename)
        figures.append({
            "type": "figure", "src": f"/images/supply-chain-whitepapers/7/{filename}", "alt": alt,
            "caption": "原刊印刷第 29 页招聘海报（岗位、待遇及联系方式均为历史信息）",
            "width": pix.width, "height": pix.height,
            "source": direct_source(7, 16, 29, "right", rect_values),
        })
    section = next(section for section in sections if section["title"] == title)
    poster_area = [660, 70, 1145, 660]
    section["blocks"] = [
        {"type": "paragraph", "text": "人生有很多种可能，只要勇敢一次，往往能得到的东西能比想象中多得多，譬如说现在，我们招人了，你勇敢投简历了吗？", "source": direct_source(7, 16, 29, "right", [660, 70, 1145, 100])},
        *figures,
        {"type": "review-note", "text": "PDF physical page 16 右侧的两张独立招聘海报以局部原图保留；其中岗位、薪酬、福利和联系方式为原刊历史招聘信息，不作为当前招聘要约。", "source": direct_source(7, 16, 29, "right", poster_area)},
    ]


def curate_issue_eight_logistics_conclusion(sections: list[dict]) -> None:
    """Restore only the p13/left two-column conclusion in left-then-right order."""
    section = next(section for section in sections if section["title"] == "数字化物流系统：鞋服行业的战略之翼")
    source_bbox = [65, 645, 550, 750]
    source_value = direct_source(8, 13, 22, "left", source_bbox)
    conclusion = "总而言之，数字化物流系统已成为鞋服品牌迈向成功的关键因素，实现商流、物流、信息流一体化。通过数字化物流系统的应用，企业能够更好地掌握市场需求、优化库存管理、提高物流效率、降低成本并增强市场竞争力。在未来的市场竞争中，数字化物流系统的应用将更加不可或缺。因此，鞋服品牌应积极拥抱数字化物流系统，将其作为提升运营效率和降低成本的重要手段。在这片浩渺的市场竞争中，数字化物流系统将为鞋服品牌提供翱翔的战略之翼，助力其飞向更加辉煌的未来。"
    revised = []
    inserted = False
    for block in section["blocks"]:
        source = block.get("source", {})
        bbox = source.get("bbox", [0, 0, 0, 0])
        if source.get("pdfPage") == 13 and source.get("side") == "left" and bbox[1] >= 640:
            if not inserted:
                revised.append({"type": "paragraph", "text": conclusion, "source": source_value})
                inserted = True
            continue
        revised.append(block)
    section["blocks"] = revised


def curate_issue_nine_esg_data_panel(sections: list[dict]) -> None:
    """Preserve the historical blue data panel as an image, not false OCR prose."""
    section = next(section for section in sections if section["title"] == "鞋服云仓：创新服务模式与 ESG 理念的完美融合")
    panel_rect = [65, 585, 550, 750]
    doc = pymupdf.open(PDF_ROOT / "9.pdf")
    directory = IMAGE_ROOT / "9"
    directory.mkdir(parents=True, exist_ok=True)
    output = directory / "esg-historical-data-panel.png"
    pix = doc[2].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=pymupdf.Rect(panel_rect), alpha=False)
    pix.save(output)
    source_value = direct_source(9, 3, 2, "left", panel_rect)
    panel = {
        "type": "figure", "src": "/images/supply-chain-whitepapers/9/esg-historical-data-panel.png",
        "alt": "鞋服云仓 ESG 文章的历史数据说明框，包含全国专业服装仓面积超 50 万 m²等原刊信息",
        "caption": "原刊印刷第 2 页蓝色历史数据说明框（图内数据请核 PDF 原版）",
        "width": pix.width, "height": pix.height, "source": source_value,
    }
    revised = []
    inserted = False
    for block in section["blocks"]:
        source = block.get("source", {})
        bbox = source.get("bbox", [0, 0, 0, 0])
        if source.get("pdfPage") == 3 and source.get("side") == "left" and bbox[1] >= 585:
            if not inserted:
                revised.extend([panel, {"type": "review-note", "text": "PDF physical page 3 左侧蓝色数据说明框以局部原图保留；OCR 曾将“超 50 万 m²”误读为“超 50 万只”，不作为正文发布。", "source": source_value}])
                inserted = True
            continue
        revised.append(block)
    section["blocks"] = revised


def curate_issue_eleven_report_page_seven(sections: list[dict]) -> None:
    """Read physical p7's printed p10 left-before-right, then p11 in order."""
    title = "2024 国际物流数字化生存报告：韧性、AI 与全球化新格局"
    left = [65, 105, 550, 780]
    right = [660, 205, 1145, 780]

    def block(text: str, side: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(11, 7, 10 if side == "left" else 11, side, bbox)}

    report = curated_section(title, 7, 10, left, [
        block("◎ 文章来源：艾瑞网", "left", left, "quote"),
        block("导语：全球物流进入“算法战争”时代", "left", left, "subheading"),
        block("国际航运研究机构 DHL 最新数据显示：2024 年全球跨境电商物流市场规模突破 8.3 万亿美元，但行业平均利润率同比下降至 4.7%——“效率黑洞”正在吞噬传统物流企业的生存空间。中国物流科技企业如何破局？本文通过一家典型的国际物流科技公司 WallTech 为样本拆解行业趋势与本土标杆案例，揭示数字化生存的终极答案。", "left", left),
        block("一、2024 国际物流三大变革引擎", "left", left, "subheading"),
        block("1、从“经验主义”到“感知网络”", "left", left, "subheading"),
        block("根据 Gartner 报告，78% 的货代企业将在 2024 年部署 AI 决策系统，通过实时抓取港口拥堵指数、地缘政治风险（如红海危机预警模型）、碳税规则变动等 200+ 维度数据，重构物流决策链。", "left", left),
        block("2、“最小颗粒度”成本革命", "left", left, "subheading"),
        block("马士基 2024 Q1 财报披露：通过机器学习优化集装箱装载方案，单箱操作成本降低 8.2%。行业共识：未来竞争焦点将从“运力规模”转向“每公斤货品的算法优化能力”。", "left", left),
        block("3、弹性供应链的“数字孪生”", "left", left, "subheading"),
        block("亚马逊全球物流启用供应链虚拟映射系统，将客户订单履约时效波动率压缩至 4% 以内。这预示着：物理世界的物流网络，正被数字世界的模拟推演重新定义。", "left", left),
        block("二、行业启示录：谁在定义下一代国际物流系统？", "left", left, "subheading"),
        block("“未来的物流巨头，本质是数据与算法的聚合器。”——麦肯锡《2024 全球物流科技白皮书》", "left", left, "quote"),
        block("WallTech 科技的实践印证了这一趋势：", "left", left),
        block("1、数据沉淀", "left", left, "subheading"),
        block("WallTech 累计处理 3.4 亿条物流业务，构建行业最大异常工况数据库。", "left", left),
        block("2024 年，CargoWare 系统全年迭代 175 次，其中，平台常态化升级 55 次，配合客户需求升级 120 次。eTower 系统全年迭代 151 次，平台常态化升级 52 次，配合客户需求升级 99 次。", "left", left),
        block("eTower 累计已对接 120+ 全球尾程物流资源、13 个全球主流电商平台和数据服务平台、12 家 ERP 系统；除平台用户本身外，系统还对接了超 110 家物流商系统，数字化赋能 878+ 物流产品（渠道），覆盖 220 个国家和地区，编织一张横跨全球、互联互通的一体化云端供应链“巨网”。", "left", left),
        block("2、生态壁垒", "left", left, "subheading"),
        block("2024 年 WallTech 基于 13 年全球国际物流行业积累，联合用户和合作伙伴共同打造了物流生态圈——沃行之家（WallTech Family）。通过整合国际物流供应链上各方资源，为用户提供物流系统的同时进行业务赋能，基于 WallTech 全球合作伙伴网络提供所需的物流资源，最终达成多方可持续共赢。", "left", left),
        block("沃行之家将致力于将 CargoWare 和 eTower 用户与更多优质的物流资源对接，并通过扩展沃行之家社区，吸引更多物流资源方加入，构建更加强大的全球物流生态圈。", "left", left),
        block("3、价值升维", "right", right, "subheading"),
        block("2024 年，传统国际货代与跨境电商物流系统全面融合。CargoWare 国际货代物流云服务和 eTower 跨境电商物流协同云服务在一个平台上深度融合：彻底打通传统货代和跨境电商物流业务壁垒，通过统一接单中心获取订单后，系统依据预设的智能规则，将订单派发至相应的业务单元进行高效执行。", "right", right),
        block("所有业务数据则统一发送到财务系统中，实现了业务与财务的一体化。在业态融合的大趋势下，越来越多的企业同时兼备干线端物流操作和跨境电商海外仓、直邮包裹物流业务。如今，这样的企业可以享受在同一平台管理所有物流业务的便利。", "right", right),
        block("2024 年，AI 赋能国际物流数字化管理", "right", right, "subheading"),
        block("CargoWare 和 eTower 接入 Claude 3.5、OpenAI、DeepSeek 在内的多家世界顶尖 AI 大模型，深度赋能：托书识别、运价识别、自动对账、局部交互体验提升、内部知识库系统等功能。", "right", right),
        block("1、2023 年 Q2：率先引入 GPT-4，建立最初的“企业知识大脑”，将海量货代业务数据（报关、订舱、运输、历史案例等）进行语义解析与统一整合。", "right", right),
        block("2、2024 年 Q1：引入 Claude，在 GPT-4 架构之上进一步强化语义联想与推理深度，对多样化的行业文档与实践案例做精准关联与逻辑梳理。", "right", right),
        block("3、2024 年 Q2：引入 DeepSeek，结合货代行业特定场景的深度学习需求，对专业领域的规则、术语、流程进行定制化训练，形成垂直化的知识库。", "right", right),
        block("两大平台以“深度智能、全链贯通”为核心，推出涵盖操作流程、智能决策、跨系统协作的 10 项革新功能，标志着国际物流行业迈入“全场景智能化”新阶段。", "right", right),
        block("结语：数字化生存的终极命题", "right", right, "subheading"),
        block("当全球物流业在不确定性中寻找确定性，中国科技企业 WallTech 给出的答案是：用比特世界的精准，对抗原子世界的熵增。这场无声的效率革命中，或许正孕育着下一个国际物流规则的制定者。", "right", right),
    ], side="left")
    index = next(index for index, section in enumerate(sections) if section["title"] == title)
    sections[index] = report


def curate_issue_twelve_service_quality(sections: list[dict]) -> None:
    """Merge the clear p3/right '卷服务质量' continuation without OCR symbols."""
    section = next(section for section in sections if section["title"] == "服装品牌的长寿法则——躺着卷")
    source_value = direct_source(12, 3, 3, "right", [660, 318, 1120, 405])
    text = "4. 卷服务质量：在售后环节，通过精细化的产品描述、准确的尺码推荐和细致的售后服务，减少因质量不符和尺码不合适导致的退货。同时，优化库存管理，利用数据分析预测消费者需求，合理控制库存水平。在物流配送方面，选择优质的物流合作伙伴，提高配送效率，减少物流时间，提升消费者购物体验。"
    revised = []
    inserted = False
    for block in section["blocks"]:
        source = block.get("source", {})
        bbox = source.get("bbox", [0, 0, 0, 0])
        if source.get("pdfPage") == 3 and source.get("side") == "right" and 315 <= bbox[1] <= 405:
            if not inserted:
                revised.append({"type": "paragraph", "text": text, "source": source_value})
                inserted = True
            continue
        revised.append(block)
    section["blocks"] = revised


def curate_issue_eleven_opening(sections: list[dict]) -> None:
    """Source-verified preface from issue 11 physical p3 left, not raw OCR."""
    def block(text: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(11, 3, 2, "left", bbox)}

    sections[0]["blocks"] = [
        block("◎ 文／王伟", [55, 130, 300, 175], "quote"),
        block("2024，最后时刻，无论大家经历了什么，我们庆幸，每一年这个时候能和大家一起跨年，每一年，能有机会和大家分享我们的一年。", [55, 190, 540, 255]),
        block("在经历了八年的创业时光，对于我们创业团队而言，新亦源，不仅是一家公司，更是一家企业，有团队的责任、有行业的使命、有对未来的追求。", [55, 255, 540, 315]),
        block("过去的八年，让我们知道只要正心、正念、坚持梦想，天地都会为你让路，我们每个人用极度认真的态度对待每一个客户、每一个问题，于是我们拥有了全国 1500 个同行伙伴，我们拥有了行业品牌。在这里，我向所有用汗水和行动滋养我们的伙伴们表示感谢，感谢大家陪伴我们一同成长。", [55, 315, 540, 405]),
        block("2024，市场经济的寒风贯穿一整年下来，周围的很多朋友、同学躺平了。寒冬像一面镜子，照出了人性的贪婪，但市场从来不会辜负一路取经人，我一直相信，只要心中有佛，比抵达灵山更加重要。一路下来，感触最深的是我们都全心投入、兢兢业业在思考如何发展公司、如何管理好公司的管理团队，是这样一个团队支撑起来公司持续前进的动力和希望，是我们每次面临危机和困难的时候永远有这样的团队在努力地战斗，伊人、郁太、程浩、老江、伟奎、高姐、曾静……还有我们在一线奋斗的千人军团的伙伴们。", [55, 405, 540, 545]),
        block("2024 是深刻成长的一年，我们经历了***项目中标而放弃，很多时候要抵制住诱惑；我们流失了***华东仓，我们知道，要懂得放弃贪婪和欲望；我们掉进了***项目巨大的坑（我创业以来最大一次亏损），让我们知道，我们距离专业还有很长距离，让我们更加知道千军易得、良将难求；我们经历了**、**招标的危机，我们面对了所有客户在这一年降价洗礼，我们活下来了，我们经历了各种洗礼后成长了，我们更加相信，保持善心、坚定信心、言行一致走下来，这样的团队具备应对各种困难和风险的能力。", [55, 545, 540, 685]),
        block("回头一望，我们又在人间一年，时光不语，2024，我们各地都业务量逆势增长。以前我总说选择比努力重要很多，我们选择了一个穿越周期的行业，伴随着市场稳定增长，现在我知道了，只有无限的努力，只有无私的行动，只有你做到感天动地，这个企业才能有存活的机会，因为我们从来不是为了自己在战斗，我们始终希望团队越来越好，想尽一切办法创造给大家提高收入、提高奖励方案，我们八年来一直初心未变，这是我们活下来的基础，让大家在这里提高收入、创造快乐。", [55, 685, 540, 800]),
        block("如果重新选择，还会过 2024 么？虽然教训深刻，虽然我们代价巨大，但是时光已逝，我不会再选择。因为我知道 2025，我们会更好。我们已经在行动了，因为我们知道我们还不够好，我们一直在努力，我们在做人才盘点、我们在做年度计划、我们正在做全员计件方案、我们在做效率提升奖励，我们 2025 会更上一层楼。", [55, 670, 540, 790]),
    ]


def restore_luna_confirmed_regions(issue: int, sections: list[dict]) -> None:
    """Restore only regions Luna confirmed legible from the original PDF crops."""
    restorations: dict[tuple[int, str, tuple[float, ...]], list[str]] = {
        (9, "left", (65.5, 296.3, 210.6, 442.4)): [
            "在快速变化的时尚鞋服市场中，品牌商们面临着诸多挑战，其中最为迫切的便是如何在保证产品质量与顾客满意度的同时，提高库存周转效率。而鞋服云仓的兴起，正为行业带来了颠覆性的解决方案，同时秉承环境、社会和治理（ESG）原则，展现了其作为行业领导者的责任感和前瞻性思维。",
        ],
        (12, "left", (65.5, 208.4, 294.5, 270.4)): [
            "近两年，服装电商行业经历了深刻变革，头部网红女装店闭店、中小规模店铺转让量增加、退货率飙升、流量成本高企以及低价内卷等问题不断涌现，让行业面临前所未有的挑战。",
        ],
        (13, "left", (102.6, 221.0, 370.8, 301.3)): [
            "伙伴们，“九四”大阅兵虽已落下帷幕，但每当我们重温那些画面，整齐划一的队伍、气势如虹的场面，依然让人心潮澎湃、振奋不已。这让我们深深明白：无论是在抗击日寇的烽火岁月，还是在抗美援朝的艰苦战场，真正决定胜负的，从来不是精良的装备，而是那份威武不屈、坚忍不拔的精神与意志。",
        ],
        (13, "left", (102.6, 303.5, 370.8, 412.6)): [
            "如今，商场如战场，更是我们挥洒汗水的现场。这两年，我们始终围绕“打造一个干净、整齐的仓库”不断探讨、持续行动。时代的进步与市场的变迁，让我们清醒地意识到：如果连最基础的库容库貌都做不好，我们凭什么赢得客户的信赖与市场的认可？今年是我们夯实内部管理的关键一年，我们心无旁骛，全力以赴，只为把“干净、整齐”这四个字，真正刻进仓库的每一个角落。",
        ],
        (13, "left", (102.6, 419.0, 370.8, 565.2)): [
            "回首八年前，在同样的物流云仓赛道上，客户更倾向于选择外资或国内大型物流企业。但我们没有退缩，而是坚定地选择了这条路。八年来，我们深耕服装云仓这一细分领域，持续作战、不曾停步。如今，我们已具备管理 50 万平米仓库的能力，成长为近两千人的团队。这份成绩，是荣誉，更是沉甸甸的责任。在国内，我们是唯一一家专注服装云仓的企业，以专业力量推动行业持续领先。正因如此，我们必须把仓库做得干净、整齐——这不仅是成为行业冠军的基石，更是对我们自身行为与习惯的淬炼与提升。",
        ],
    }
    for section in sections:
        revised: list[dict] = []
        for block in section["blocks"]:
            source = block.get("source")
            key = None
            if source:
                key = (issue, source["side"], tuple(source["bbox"]))
            texts = restorations.get(key) if key else None
            if not texts:
                revised.append(block)
                continue
            for text in texts:
                revised.append({"type": "paragraph", "text": text, "source": source})
        section["blocks"] = revised

    if issue != 13:
        return
    # Luna's physical p8/right crop contains three fully readable meeting
    # paragraphs.  They replace the one overly broad review note at this bbox.
    target = (8, "right", (694.5, 253.8, 1059.9, 486.0))
    for section in sections:
        revised = []
        for block in section["blocks"]:
            source = block.get("source")
            key = (source["pdfPage"], source["side"], tuple(source["bbox"])) if source else None
            if key != target:
                revised.append(block)
                continue
            for text in [
                "近日，新亦源 2026 年度战略规划会议在增城白水寨成功召开。会议旨在全面分析当前市场形势，明确公司下一年度的核心发展方向与战略目标。公司管理层核心成员与长期战略合作伙伴——卓越商学咨询的专家团队共同出席了本次会议，集思广益，共绘发展蓝图。",
                "会上，卓越商学咨询的专家基于其对行业趋势的深刻洞察，为公司的战略规划提供了宝贵的第三方视角和专业指导，各部门负责人就当前业务态势、机遇挑战及未来增长点进行了深入汇报与讨论。",
                "本次会议初步明确了公司 2026 年的战略发展基调和几大战略战役。它不仅是一次思想的碰撞，更是一次行动的集结，为公司在复杂市场中保持定力、精准发力奠定了坚实的基础。",
            ]:
                revised.append({"type": "paragraph", "text": text, "source": source})
        section["blocks"] = revised


def correct_issue_thirteen_tour(sections: list[dict]) -> None:
    """Restore the complete readable p15 spread in its printed reading order."""
    title = "致敬优秀，逐浪笔架山——东莞电商仓第三季度优秀员工团建"
    left_header = [65, 105, 550, 190]
    left_intro = [65, 230, 550, 350]
    left_heading = [65, 400, 550, 455]
    left_start = [65, 460, 550, 510]
    left_raft = [65, 510, 550, 594]
    left_finish = [65, 594, 290, 710]
    right_rest_heading = [820, 385, 1145, 430]
    right_rest = [820, 430, 1145, 520]
    right_return_heading = [660, 560, 1145, 625]
    right_return = [660, 625, 1145, 760]

    def block(text: str, printed_page: int, side: str, bbox: list[float], kind: str = "paragraph") -> dict:
        return {"type": kind, "text": text, "source": direct_source(13, 15, printed_page, side, bbox)}

    tour = curated_section(title, 15, 26, left_header, [
        block("◎ 文／陈燕", 26, "left", left_header, "quote"),
        block("为表彰第三季度在岗位上深耕实干、业绩突出的优秀员工，传递公司“尊重优秀、赋能骨干”的人才理念，东莞电商仓特组织优秀员工团队赴笔架山旅游区开展团建活动。这场以“漂流逐趣、聚力同行”为主题的旅程，既是对优秀者的专属回馈，更让骨干力量在自然与协作中凝聚新动能。", 26, "left", left_intro),
        block("逐浪而行：在激流中见协作，于欢笑中显默契", 26, "left", left_heading, "subheading"),
        block("抵达笔架山时，山间的清风已驱散了旅途的疲惫。领取装备、分组组队的环节里，平时在仓库里精准拣货、在后台高效处理订单的优秀员工们，迅速切换状态——有人主动帮同事检查救生衣，有人提前研究漂流路线“支招”，连平时最沉稳的分拣组长都笑着说“今天咱们比的不是速度，是快乐”。", 26, "left", left_start),
        block("随着橡皮艇推开水面，漂流正式启程。初遇平缓水域时，大家还能悠闲欣赏两岸的翠绿山景；转过弯道进入激流段，浪花瞬间溅满船身，尖叫声与欢呼声在山谷里回荡。有人掌舵把控方向，有人伸手避开礁石，遇到浅滩搁浅时，相邻船只的伙伴立刻伸手相助，你拉我推间，橡皮艇重新起航。那些在工作中并肩攻克订单高峰、协同优化分拣流程的默契，此刻化作了激流中最坚实的“后背”——就像平时为了按时发货共同加班到深夜，此刻为了顺利冲过险滩，大家依旧心往一处想、劲往一处使。", 26, "left", left_raft),
        block("冲过最后一段陡坡，橡皮艇在平缓水域停下时，每个人的脸上都挂着水珠与笑容。有人调侃“今天的‘湿身’比打赢一场大促还痛快”，有人拿出手机记录彼此的“狼狈样”，镜头里的每一张笑脸，都藏着优秀者之间的惺惺相惜，更藏着团队共闯难关的温暖。", 26, "left", left_finish),
        block("林间小憩：在自然里放松，于交流中蓄力", 27, "right", right_rest_heading, "subheading"),
        block("简单的午餐后，大家沿着山间步道散步，听着鸟鸣、闻着草木香，享受着难得的松弛。此刻没有 KPI 的追赶，没有订单的催促，只有优秀伙伴间的轻松交流，和对自然的慢赏——公司始终相信，优秀人才的成长，既需要工作中的打磨，也需要生活里的滋养；而让骨干们在自然中放松、在交流中碰撞，正是为下一阶段的奋斗蓄力。", 27, "right", right_rest),
        block("返程：带着热爱，奔赴新程", 27, "right", right_return_heading, "subheading"),
        block("夕阳西下时，大家带着满身的活力与笑意踏上归途。有人说“下次还要跟这群‘战友’一起闯”，有人在群里分享着漂流的照片，更有人悄悄立下“第四季度继续拿优秀”的目标。", 27, "right", right_return),
        block("这场笔架山之旅，不仅是对东莞电商仓第三季度优秀员工的肯定，更是公司“以优秀引领优秀，以骨干带动团队”的初心体现。未来，我们将继续为每一位深耕岗位的优秀者搭建成长舞台、送上专属回馈，也期待更多伙伴以骨干为榜样，在电商仓的赛道上并肩奔跑，共赴更精彩的下一程！", 27, "right", right_return),
    ], side="left")
    index = next(index for index, section in enumerate(sections) if section["title"] == "东莞电商仓第三季度优秀员工团建")
    sections[index:index + 1] = [tour]


def validate_sources(issue: int, sections: list[dict]) -> None:
    """Fail closed when generated source metadata is not a PDF-point rectangle."""
    doc = pymupdf.open(PDF_ROOT / f"{issue}.pdf")
    for section in sections:
        for source in [section["source"], *(block.get("source") for block in section["blocks"])]:
            if not source or "bbox" not in source:
                raise RuntimeError(f"issue {issue}: source bbox missing")
            page_number = source["pdfPage"]
            if not isinstance(page_number, int) or not 1 <= page_number <= len(doc):
                raise RuntimeError(f"issue {issue}: source page out of range: {page_number!r}")
            bbox = source["bbox"]
            if not isinstance(bbox, list) or len(bbox) != 4 or not all(
                isinstance(value, (int, float)) and math.isfinite(value) for value in bbox
            ):
                raise RuntimeError(f"issue {issue}: invalid source bbox: {bbox!r}")
            x0, y0, x1, y1 = bbox
            rect = doc[page_number - 1].rect
            if not (0 <= x0 < x1 <= rect.width and 0 <= y0 < y1 <= rect.height):
                raise RuntimeError(f"issue {issue}: source bbox outside PDF points: p{page_number} {bbox!r} / {rect!r}")


def render_figure(issue: int) -> dict:
    physical_page, rect_values, alt, caption = FIGURE_CLIPS[issue]
    doc = pymupdf.open(PDF_ROOT / f"{issue}.pdf")
    page = doc[physical_page - 1]
    rect = pymupdf.Rect(rect_values)
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=rect, alpha=False)
    directory = IMAGE_ROOT / str(issue)
    directory.mkdir(parents=True, exist_ok=True)
    output = directory / "source-context-01.png"
    pix.save(output)
    side = "full" if issue == 10 else "left"
    return {
        "type": "figure",
        "src": f"/images/supply-chain-whitepapers/{issue}/{output.name}",
        "alt": alt,
        "caption": caption,
        "width": pix.width,
        "height": pix.height,
        "source": {"pdfPage": physical_page, "printedPage": None if issue == 10 else 2, "side": side, "bbox": rect_values},
    }


def render_issue_six_chart() -> None:
    doc = pymupdf.open(PDF_ROOT / "6.pdf")
    page = doc[3]
    rect = pymupdf.Rect([230, 205, 540, 710])
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=rect, alpha=False)
    output = IMAGE_ROOT / "6" / "textile-upstream-charts.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    pix.save(output)
    page = doc[4]
    rect = pymupdf.Rect([65, 560, 525, 800])
    pix = page.get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=rect, alpha=False)
    pix.save(IMAGE_ROOT / "6" / "video-channel-live-examples.png")


def render_issue_ten_figures() -> None:
    doc = pymupdf.open(PDF_ROOT / "10.pdf")
    directory = IMAGE_ROOT / "10"
    directory.mkdir(parents=True, exist_ok=True)
    for page, rect_values, filename in [
        (6, [300, 235, 550, 360], "cloud-warehouse-floor.png"),
        (7, [385, 190, 550, 365], "huaqiao-warehouse-scenes.png"),
    ]:
        pix = doc[page - 1].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=pymupdf.Rect(rect_values), alpha=False)
        pix.save(directory / filename)


def render_audited_figures(issue: int, sections: list[dict]) -> None:
    """Render only Luna-viewed, source-bounded figures; never a whole page."""
    doc = pymupdf.open(PDF_ROOT / f"{issue}.pdf")
    directory = IMAGE_ROOT / str(issue)
    directory.mkdir(parents=True, exist_ok=True)
    if issue == 6:
        sections[2]["blocks"] = [
            block for block in sections[2]["blocks"]
            if block.get("src") != "/images/supply-chain-whitepapers/6/textile-upstream-charts.png"
        ]
    for _, section_index, physical_page, side, rect_values, filename, alt, caption in [
        item for item in AUDITED_FIGURES if item[0] == issue
    ]:
        rect = pymupdf.Rect(rect_values)
        pix = doc[physical_page - 1].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), clip=rect, alpha=False)
        output = directory / filename
        pix.save(output)
        printed_page = None
        if issue in LANDSCAPE_ARTICLES:
            printed_page = 2 * (physical_page - 3) + (2 if side == "left" else 3)
        figure = {
            "type": "figure",
            "src": f"/images/supply-chain-whitepapers/{issue}/{filename}",
            "alt": alt,
            "caption": caption,
            "width": pix.width,
            "height": pix.height,
            "source": direct_source(issue, physical_page, printed_page, side, rect_values),
        }
        sections[section_index]["blocks"].insert(0, figure)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--issues", default="all")
    args = parser.parse_args()
    requested = list(range(6, 14)) if args.issues == "all" else sorted({int(value) for value in args.issues.split(",")})
    if any(issue not in range(6, 14) for issue in requested):
        raise RuntimeError("this converter owns issues 6–13 only")
    catalog = {item["issue"]: item for item in json.loads(CATALOG.read_text(encoding="utf-8"))["issues"]}
    for issue in requested:
        entry = catalog[issue]
        pdf = PDF_ROOT / f"{issue}.pdf"
        if hashlib.file_digest(pdf.open("rb"), "sha256").hexdigest() != entry["source"]["sha256"]:
            raise RuntimeError(f"issue {issue}: source hash changed; re-audit OCR first")
        sections = generated_sections(issue, entry)
        sanitize_public_sections(issue, sections)
        for section in sections:
            note = NOISY_SECTION_NOTES.get(issue, {}).get(section["title"])
            if note:
                section["blocks"].append({"type": "review-note", "text": note, "source": section["source"]})
        if issue == 6:
            curate_issue_six(sections)
            curate_issue_six_tail(sections)
            render_issue_six_chart()
        if issue == 10:
            curate_issue_ten(sections)
            curate_issue_ten_opening(sections)
            curate_issue_ten_page_eight(sections)
            curate_issue_ten_page_nine(sections)
            curate_issue_ten_page_ten(sections)
            sanitize_public_sections(issue, sections)
            render_issue_ten_figures()
        if issue == 7:
            curate_issue_seven_recruitment_posters(sections)
        if issue == 8:
            curate_issue_eight_logistics_conclusion(sections)
        if issue == 9:
            curate_issue_nine_esg_data_panel(sections)
        if issue == 11:
            curate_issue_eleven_opening(sections)
            curate_issue_eleven_report_page_seven(sections)
        if issue == 12:
            curate_issue_twelve_quality(sections)
            curate_issue_twelve_activities(sections)
            curate_issue_twelve_known_retest_regions(sections)
            curate_issue_twelve_service_quality(sections)
        if issue in (6, 10):
            sections[0]["blocks"].insert(0, render_figure(issue))
        render_audited_figures(issue, sections)
        restore_luna_confirmed_regions(issue, sections)
        if issue == 13:
            correct_issue_thirteen_tour(sections)
        annotate_review_notes(sections)
        validate_sources(issue, sections)
        payload = {
            "issue": str(issue), "originalTitle": f"《森林期刊》第{issue}期",
            "title": title_for(entry), "description": DESCRIPTIONS[issue],
            "sourcePdf": f"/senlinqikan/pdf/{issue}.pdf", "sourceSha256": entry["source"]["sha256"],
            "sourcePublishedLabel": PUBLISHED_LABELS[issue],
            "readingNotice": "本阅读版依据原刊 OCR 与版面整理。文中的年份、数字、案例和表述均保留历史语境，不构成当前服务承诺；请以 PDF 原版核验图表、图片文字和待核查区域。",
            "sections": sections,
        }
        DATA_ROOT.mkdir(parents=True, exist_ok=True)
        (DATA_ROOT / f"{issue}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        # Review notes, headings and captions document uncertainty but are not
        # converted source prose.  Keep the reported metric honest for audit.
        chars = sum(
            len(block.get("text", ""))
            for section in sections for block in section["blocks"]
            if block["type"] in {"paragraph", "quote", "list"}
        )
        review_count = sum(block["type"] == "review-note" for section in sections for block in section["blocks"])
        figure_count = sum(block["type"] == "figure" for section in sections for block in section["blocks"])
        print(f"issue {issue}: {len(sections)} sections, {chars} chars, {figure_count} figures, {review_count} review-note")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
