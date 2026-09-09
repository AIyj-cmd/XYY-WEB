"""Static contract checks for the offline OCR archive conversion (issues 6–13)."""
from __future__ import annotations

import hashlib
import json
import math
import unittest
from pathlib import Path

import pymupdf


ROOT = Path(__file__).resolve().parents[2]


class ArchiveConversionContractTest(unittest.TestCase):
    def test_archive_data_is_traceable_and_has_readable_content(self) -> None:
        for issue in range(6, 14):
            with self.subTest(issue=issue):
                payload = json.loads((ROOT / "src/data/whitepapers" / f"{issue}.json").read_text(encoding="utf-8"))
                self.assertEqual(payload["issue"], str(issue))
                self.assertEqual(payload["sourcePdf"], f"/senlinqikan/pdf/{issue}.pdf")
                source_pdf = ROOT / "public/senlinqikan/pdf" / f"{issue}.pdf"
                self.assertEqual(payload["sourceSha256"], hashlib.sha256(source_pdf.read_bytes()).hexdigest())
                self.assertGreaterEqual(len(payload["sections"]), 7)

                paragraphs = [block for section in payload["sections"] for block in section["blocks"] if block["type"] == "paragraph"]
                self.assertGreater(sum(len(block["text"]) for block in paragraphs), 4000)
                self.assertTrue(all("iframe" not in block.get("text", "").lower() for block in paragraphs))
                figures = [block for section in payload["sections"] for block in section["blocks"] if block["type"] == "figure"]
                self.assertGreaterEqual(len(figures), 1)
                for figure in figures:
                    self.assertTrue(figure["src"].startswith(f"/images/supply-chain-whitepapers/{issue}/"))
                    self.assertTrue((ROOT / "public" / figure["src"].lstrip("/")).is_file())
                    self.assertLess(figure["width"] * figure["height"], 1800 * 1800)
                self.assertTrue(any(block["type"] == "review-note" for section in payload["sections"] for block in section["blocks"]))
                for section in payload["sections"]:
                    for block in section["blocks"]:
                        if block["type"] == "review-note":
                            self.assertIn("PDF physical page", block["text"])
                            self.assertIn("bbox [", block["text"])

    def test_issue_six_curated_regions_do_not_emit_chart_noise_or_cut_off_virtual_try_on(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/6.json").read_text(encoding="utf-8"))
        self.assertEqual(payload["originalTitle"], "《森林期刊》第6期")
        article_text = "\n".join(
            block.get("text", "") for section in payload["sections"] for block in section["blocks"]
        )
        for known_noise in ("BA 328 级梯价", "一六贷人", "- se] ead"):
            self.assertNotIn(known_noise, article_text)
        self.assertIn("还能使消费者与产品建立更为紧密的联系，从而提升转化率。".replace("，", "， "), article_text)
        self.assertIn("来试水各种新功能。", article_text)
        self.assertIn("Snapchat 虽然", article_text)
        third = payload["sections"][2]
        self.assertEqual(third["source"]["pdfPage"], 4)
        self.assertTrue(any(block.get("src", "").endswith("fig1-2.png") for block in third["blocks"]))
        self.assertTrue(any(block["type"] == "review-note" and "图 1 至图 14" in block["text"] for block in third["blocks"]))

    def test_issue_ten_opening_is_source_text_and_embedded_spreads_are_split(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/10.json").read_text(encoding="utf-8"))
        self.assertEqual(
            [section["title"] for section in payload["sections"][2:7]],
            [
                "服装电商倒闭潮来袭：服装云仓或成破局关键",
                "物流革命：跨境电商如何借力服装云仓",
                "喜报连连：新亦源鞋服云仓花桥仓开仓大吉",
                "合肥开仓势如破竹，首日万鞋入库显神威",
                "新起点·新使命·新征程：新亦源总部乔迁之喜",
            ],
        )
        opening = "\n".join(block.get("text", "") for block in payload["sections"][0]["blocks"])
        gmv = "\n".join(block.get("text", "") for block in payload["sections"][1]["blocks"])
        self.assertIn("奋战三个通宵梳理数据", opening)
        self.assertIn("信息的流动和拆解永远是即时性的", gmv)
        self.assertIn("COCO ZONE 全部采用顺丰发货", gmv)
        blocks = [
            block
            for section in payload["sections"][:2]
            for block in section["blocks"]
            if block["type"] in {"paragraph", "quote"}
        ]

        def source_for(prefix: str) -> dict:
            return next(block["source"] for block in blocks if block["text"].startswith(prefix))

        story_source = source_for("回首与新亦源共同成长的七年")
        opening_source = source_for("女装行业没有秘密")
        delivery_source = source_for("为了保证消费者的购物体验")
        self.assertEqual(story_source, {"pdfPage": 3, "printedPage": None, "side": "full", "bbox": [95, 410, 300, 780]})
        self.assertEqual(opening_source, {"pdfPage": 4, "printedPage": None, "side": "full", "bbox": [95, 35, 300, 400]})
        self.assertEqual(delivery_source, {"pdfPage": 5, "printedPage": None, "side": "full", "bbox": [295, 35, 510, 400]})
        self.assertNotEqual(story_source["bbox"], [105, 620, 295, 760])
        self.assertNotEqual(opening_source["bbox"], [100, 150, 295, 300])
        self.assertNotEqual(delivery_source["bbox"], [315, 410, 500, 500])
        for known_noise in ("HR数据", "RAL,HOH", "SBCAMUTE", "ARNG—"):
            self.assertNotIn(known_noise, opening + gmv)

    def test_known_cross_column_fragments_and_duplicate_h2_are_not_public_paragraphs(self) -> None:
        known_fragments = (
            "大学生入冬指南 ” 与", "@ 路年", "ACSERGABNHEXS", "退货率帮升",
            "5 月纺织", "装出口分化加剧，", "MEARS |", "DBHR 安排面试",
        )
        for issue in range(6, 14):
            payload = json.loads((ROOT / "src/data/whitepapers" / f"{issue}.json").read_text(encoding="utf-8"))
            for section in payload["sections"]:
                paragraphs = [block["text"] for block in section["blocks"] if block["type"] == "paragraph"]
                normalized_title = "".join(section["title"].split()).replace("—", "").replace("一", "")
                for paragraph in paragraphs:
                    normalized_paragraph = "".join(paragraph.split()).replace("—", "").replace("一", "")
                    self.assertNotEqual(normalized_paragraph, normalized_title)
                    self.assertFalse(any(fragment in paragraph for fragment in known_fragments))

    def test_issue_eleven_preface_uses_source_verified_opening(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/11.json").read_text(encoding="utf-8"))
        text = "\n".join(block.get("text", "") for block in payload["sections"][0]["blocks"])
        self.assertIn("对于我们创业团队而言", text)
        self.assertIn("市场从来不会辜负一路取经人", text)
        self.assertIn("兢兢业业在思考如何发展公司", text)
        self.assertNotIn("对于我们队而言", text)
        self.assertNotIn("贪禁", text)

    def test_luna_confirmed_regions_restore_source_prose_and_figure_alt(self) -> None:
        issue8 = json.loads((ROOT / "src/data/whitepapers/8.json").read_text(encoding="utf-8"))
        self.assertIn("在会议上，我们不仅深入了解了行业前沿动态", "\n".join(
            block.get("text", "") for block in issue8["sections"][6]["blocks"]
        ).replace(" ", ""))

        issue9 = json.loads((ROOT / "src/data/whitepapers/9.json").read_text(encoding="utf-8"))
        self.assertIn("时尚鞋服市场", "\n".join(block.get("text", "") for block in issue9["sections"][0]["blocks"]))
        self.assertIn("环境、社会和治理（ESG）原则", "\n".join(block.get("text", "") for block in issue9["sections"][0]["blocks"]))

        issue12 = json.loads((ROOT / "src/data/whitepapers/12.json").read_text(encoding="utf-8"))
        self.assertIn("服装电商行业经历了深刻变革", "\n".join(block.get("text", "") for block in issue12["sections"][0]["blocks"]))

        issue13 = json.loads((ROOT / "src/data/whitepapers/13.json").read_text(encoding="utf-8"))
        opening = "\n".join(block.get("text", "") for block in issue13["sections"][0]["blocks"])
        meeting = "\n".join(block.get("text", "") for block in issue13["sections"][6]["blocks"])
        self.assertIn("九四”大阅兵", opening)
        self.assertIn("挥洒汗水的现场", opening)
        self.assertIn("卓越商学咨询的专家团队", meeting)

        issue6 = json.loads((ROOT / "src/data/whitepapers/6.json").read_text(encoding="utf-8"))
        alt = next(block["alt"] for block in issue6["sections"][2]["blocks"] if block.get("src", "").endswith("fig3-4.png"))
        self.assertIn("涤纶长丝", alt)

    def test_issue_ten_page_nine_is_three_articles_in_source_reading_order(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/10.json").read_text(encoding="utf-8"))
        titles = [section["title"] for section in payload["sections"]]
        start = titles.index("人效通升级：全面实现面试登记无纸化")
        self.assertEqual(titles[start:start + 3], [
            "人效通升级：全面实现面试登记无纸化",
            "员工之声：打工人，你的上下班安全谁来守护？",
            "专业专注·质敬客户：服务效率提升背后的举措与成果",
        ])
        service = payload["sections"][start + 2]
        self.assertIn("重庆仓", "\n".join(block.get("text", "") for block in service["blocks"]))
        self.assertIn("湖北仓", "\n".join(block.get("text", "") for block in service["blocks"]))
        self.assertIn("东莞电商仓", "\n".join(block.get("text", "") for block in service["blocks"]))
        self.assertEqual(service["source"]["bbox"], [95, 405, 300, 780])
        referral = next(section for section in payload["sections"] if section["title"] == "内推大作战：抓住创“薪”机会")
        referral_text = "\n".join(block.get("text", "") for block in referral["blocks"])
        self.assertIn("03 内推流程＆方式", referral_text)
        self.assertNotIn("桥头、 朗州仓", referral_text)

    def test_issue_twelve_quality_and_late_article_starts_follow_source_pages(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/12.json").read_text(encoding="utf-8"))
        sections = {section["title"]: section for section in payload["sections"]}
        quality = sections["服装质检研究方向总结"]
        quality_text = "\n".join(block.get("text", "") for block in quality["blocks"])
        self.assertIn("传统服装质检技术与方法研究", quality_text)
        self.assertIn("红线六：人为次品", quality_text)
        self.assertIn("质量问题六行表", "\n".join(
            block.get("alt", "") for block in quality["blocks"] if block["type"] == "figure"
        ))
        table = next(block for block in quality["blocks"] if block.get("src", "").endswith("quality-defect-table.png"))
        self.assertEqual(table["source"]["bbox"], [55, 95, 520, 242])
        self.assertGreater(table["width"], table["height"])
        self.assertTrue(any(
            block["source"]["pdfPage"] == 13 and block["source"]["bbox"][0] <= 55
            for block in quality["blocks"]
        ))
        starts = {title: section["source"]["printedPage"] for title, section in sections.items()}
        self.assertEqual(starts["步履云端第一期：水声水库首站全纪实"], 26)
        self.assertEqual(starts["粽情端午，暖心相伴"], 27)
        self.assertEqual(starts["新亦源管理开放日·正式上线"], 29)
        self.assertEqual(starts["以赛促学，以劳为荣：看新亦源云仓如何“卷”出专业力"], 30)
        self.assertEqual(starts["温情汇聚，共谱花桥仓发展新篇——昆山花桥仓员工关怀活动纪实"], 32)
        water = sections["步履云端第一期：水声水库首站全纪实"]
        water_text = "\n".join(block.get("text", "") for block in water["blocks"])
        self.assertIn("沉入大地肌理中", water_text)
        self.assertIn("团队共振是最高效的服务器", water_text)
        self.assertNotIn("服务哲\n学实验", water_text)
        dragon = sections["粽情端午，暖心相伴"]
        dragon_text = "\n".join(block.get("text", "") for block in dragon["blocks"])
        self.assertIn("为各分仓的小伙伴们精心准备了端午暖心小福利", dragon_text)
        self.assertIn("新亦源云仓再次祝愿大家端午安康", dragon_text)
        self.assertNotIn("粽情端午， 暖心相伴新亦源云仓祝您端午安康", dragon_text)
        logistics_text = "\n".join(block.get("text", "") for block in sections["2025 年 1–5 月中国物流运行分析"]["blocks"])
        self.assertIn("5 月民航货邮运输量同比增长 16.6%", logistics_text)
        self.assertNotIn("Ft:", logistics_text)
        self.assertNotIn("并车本千", logistics_text)
        self.assertNotIn("体平稳结级力质效", logistics_text)
        anniversary_text = "\n".join(block.get("text", "") for block in sections["初心八载同欢庆，匠心织新共此时"]["blocks"])
        self.assertIn("千帆竞发再攀登。上海仓祝新亦源八周年生日快乐", anniversary_text)
        competition_text = "\n".join(block.get("text", "") for block in sections["以赛促学，以劳为荣：看新亦源云仓如何“卷”出专业力"]["blocks"])
        self.assertIn("抵达千家万户", competition_text)
        self.assertNotIn("新亦源秘庆仓", competition_text)
        huaqiao_text = "\n".join(block.get("text", "") for block in sections["温情汇聚，共谱花桥仓发展新篇——昆山花桥仓员工关怀活动纪实"]["blocks"])
        self.assertIn("昆山花桥仓精心策划并举办了员工慰问活动及新员工座谈会", huaqiao_text)
        self.assertIn("新员工座谈会在三楼员工休息区如期举行", huaqiao_text)
        self.assertNotIn("花桥仑", huaqiao_text)
        self.assertNotIn("WA重视", huaqiao_text)
        self.assertNotIn("新吴工座谈会", huaqiao_text)

    def test_issue_ten_page_eight_keeps_three_articles_in_printed_reading_order(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/10.json").read_text(encoding="utf-8"))
        titles = [section["title"] for section in payload["sections"]]
        relocation = "新起点·新使命·新征程：新亦源总部乔迁之喜"
        summer = "“饮”领夏日，关怀满载：新亦源夏日消暑行动"
        sale = "618特辑：时尚背后的力量 服装云仓揭秘"
        self.assertEqual(titles[titles.index(relocation):titles.index(relocation) + 4], [
            relocation,
            summer,
            sale,
            "人效通升级：全面实现面试登记无纸化",
        ])
        sections = {section["title"]: section for section in payload["sections"]}
        relocation_text = "\n".join(block.get("text", "") for block in sections[relocation]["blocks"])
        summer_text = "\n".join(block.get("text", "") for block in sections[summer]["blocks"])
        sale_text = "\n".join(block.get("text", "") for block in sections[sale]["blocks"])
        self.assertIn("新的起点，新的环境，新的可能性", relocation_text)
        self.assertIn("关怀与凉爽", summer_text)
        self.assertIn("在这个夏天，我们不仅仅是在传递货物", summer_text)
        self.assertNotIn("在这个夏天，我们不仅仅是在传递物资", summer_text)
        self.assertIn("退货质检服务是我们的一大亮点", sale_text)
        self.assertIn("今年的 618 电商大促活动虽然战线拉长", sale_text)
        for fragment in ("wim, ARI", "vieRe", "\\\\O", "凉变", "ae 大促"):
            self.assertNotIn(fragment, relocation_text + summer_text + sale_text)
        self.assertEqual(sections[summer]["source"]["bbox"], [300, 35, 520, 390])
        self.assertEqual(sections[sale]["source"]["bbox"], [300, 405, 520, 780])

    def test_issue_thirteen_tour_restores_headings_and_left_to_right_reading_order(self) -> None:
        payload = json.loads((ROOT / "src/data/whitepapers/13.json").read_text(encoding="utf-8"))
        title = "致敬优秀，逐浪笔架山——东莞电商仓第三季度优秀员工团建"
        tour = next(section for section in payload["sections"] if section["title"] == title)
        headings = [block["text"] for block in tour["blocks"] if block["type"] == "subheading"]
        self.assertEqual(headings, [
            "逐浪而行：在激流中见协作，于欢笑中显默契",
            "林间小憩：在自然里放松，于交流中蓄力",
            "返程：带着热爱，奔赴新程",
        ])
        text = "\n".join(block.get("text", "") for block in tour["blocks"])
        self.assertIn("团队共闯难关的温暖", text)
        self.assertIn("一起闯", text)
        self.assertIn("奋斗蓄力", text)
        self.assertLess(text.index("在交流中碰撞，正是为下一阶段的奋斗蓄力"), text.index("夕阳西下时"))
        for fragment in ("笔洪山", "一起间", "奋斗蕾力", "ee 山间", "支人"):
            self.assertNotIn(fragment, text)
        self.assertEqual(tour["source"], {
            "pdfPage": 15, "printedPage": 26, "side": "left", "bbox": [65, 105, 550, 190],
        })

    def test_targeted_retest_regions_keep_source_prose_or_source_figures(self) -> None:
        issue7 = json.loads((ROOT / "src/data/whitepapers/7.json").read_text(encoding="utf-8"))
        recruitment = next(section for section in issue7["sections"] if section["title"] == "“薪”动招募：新亦源大家庭欢迎你")
        posters = [block for block in recruitment["blocks"] if block["type"] == "figure"]
        self.assertEqual([block["src"] for block in posters[-2:]], [
            "/images/supply-chain-whitepapers/7/foshan-warehouse-recruitment-poster.png",
            "/images/supply-chain-whitepapers/7/qiaotou-warehouse-recruitment-poster.png",
        ])
        self.assertTrue(all(block["source"]["bbox"][3] == 660 for block in posters[-2:]))
        recruitment_text = "\n".join(block.get("text", "") for block in recruitment["blocks"])
        self.assertNotIn("SREWsES5", recruitment_text)
        self.assertNotIn("要表学习", recruitment_text)

        issue8 = json.loads((ROOT / "src/data/whitepapers/8.json").read_text(encoding="utf-8"))
        logistics = next(section for section in issue8["sections"] if section["title"] == "数字化物流系统：鞋服行业的战略之翼")
        logistics_text = "\n".join(block.get("text", "") for block in logistics["blocks"])
        self.assertIn("总而言之，数字化物流系统已成为鞋服品牌迈向成功的关键因素", logistics_text)
        self.assertIn("助力其飞向更加辉煌的未来", logistics_text)
        self.assertNotIn("降\\\\、低成本", logistics_text)

        issue9 = json.loads((ROOT / "src/data/whitepapers/9.json").read_text(encoding="utf-8"))
        esg = issue9["sections"][0]
        panel = next(block for block in esg["blocks"] if block.get("src", "").endswith("esg-historical-data-panel.png"))
        self.assertIn("超 50 万 m²", panel["alt"])
        self.assertEqual(panel["source"]["bbox"], [65, 585, 550, 750])
        self.assertNotIn("仓面积超 50 万只", "\n".join(block.get("text", "") for block in esg["blocks"]))

        issue11 = json.loads((ROOT / "src/data/whitepapers/11.json").read_text(encoding="utf-8"))
        report = issue11["sections"][2]
        report_text = "\n".join(block.get("text", "") for block in report["blocks"])
        self.assertIn("效率黑洞”正在吞噬传统物流企业的生存空间", report_text)
        self.assertIn("CargoWare 系统全年迭代 175 次", report_text)
        self.assertLess(report_text.index("最大异常工况数据库"), report_text.index("3、价值升维"))
        self.assertNotIn("知喉", report_text)
        self.assertNotIn("NA WallTech", report_text)
        self.assertNotIn("全年和迭代", report_text)

        issue12 = json.loads((ROOT / "src/data/whitepapers/12.json").read_text(encoding="utf-8"))
        quality = issue12["sections"][0]
        quality_text = "\n".join(block.get("text", "") for block in quality["blocks"])
        self.assertIn("4. 卷服务质量：在售后环节，通过精细化的产品描述", quality_text)
        self.assertIn("提升消费者购物体验", quality_text)
        self.assertNotIn("_ sft", quality_text)
        self.assertNotIn("优化 3B wa", quality_text)

    def test_archive_sources_are_finite_pdf_point_rectangles(self) -> None:
        for issue in range(6, 14):
            with self.subTest(issue=issue):
                payload = json.loads((ROOT / "src/data/whitepapers" / f"{issue}.json").read_text(encoding="utf-8"))
                document = pymupdf.open(ROOT / "public/senlinqikan/pdf" / f"{issue}.pdf")
                for section in payload["sections"]:
                    for source in [section["source"], *(block["source"] for block in section["blocks"])]:
                        self.assertIsInstance(source["pdfPage"], int)
                        self.assertGreaterEqual(source["pdfPage"], 1)
                        self.assertLessEqual(source["pdfPage"], len(document))
                        bbox = source["bbox"]
                        self.assertEqual(len(bbox), 4)
                        self.assertTrue(all(isinstance(value, (int, float)) and math.isfinite(value) for value in bbox))
                        x0, y0, x1, y1 = bbox
                        rect = document[source["pdfPage"] - 1].rect
                        self.assertLess(x0, x1)
                        self.assertLess(y0, y1)
                        self.assertGreaterEqual(x0, 0)
                        self.assertGreaterEqual(y0, 0)
                        self.assertLessEqual(x1, rect.width)
                        self.assertLessEqual(y1, rect.height)


if __name__ == "__main__":
    unittest.main()
