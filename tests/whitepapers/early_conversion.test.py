"""Contract checks for the reviewed, image-only early whitepaper converter."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PYTHON = sys.executable
sys.path.insert(0, str(ROOT / "scripts" / "whitepapers"))

from convert_early_issues import validate_issue_cache  # noqa: E402


class EarlyConversionTest(unittest.TestCase):
    def test_converter_regenerates_source_traceable_sections(self) -> None:
        subprocess.run(
            [PYTHON, "scripts/whitepapers/convert_early_issues.py", "--issues", "1", "2", "3", "4", "5"],
            cwd=ROOT,
            check=True,
            env={**__import__("os").environ, "PYTHONPATH": "scripts/whitepapers"},
        )

        for issue in range(1, 6):
            article = json.loads((ROOT / "src/data/whitepapers" / f"{issue}.json").read_text())
            source_pdf = ROOT / "public/senlinqikan/pdf" / f"{issue}.pdf"
            self.assertEqual(article["issue"], str(issue))
            self.assertTrue(article["originalTitle"].startswith("《新亦源森林双月刊》"))
            self.assertEqual(article["sourceSha256"], hashlib.sha256(source_pdf.read_bytes()).hexdigest())
            self.assertGreaterEqual(len(article["sections"]), 8)
            self.assertTrue(all(section["source"]["printedPage"] is None for section in article["sections"]))
            self.assertTrue(all(section["blocks"] for section in article["sections"]))
            self.assertTrue(
                all(
                    "mp.weixin" not in (block.get("text") or "")
                    for section in article["sections"]
                    for block in section["blocks"]
                )
            )

    def test_issue_one_preserves_known_non_page_sections_and_local_figures(self) -> None:
        article = json.loads((ROOT / "src/data/whitepapers/1.json").read_text())
        titles = [section["title"] for section in article["sections"]]
        self.assertIn("仓库六大守则", titles)
        self.assertIn("人机复位管理", titles)
        self.assertNotIn("森林播台", titles)
        figures = [
            block
            for section in article["sections"]
            for block in section["blocks"]
            if block["type"] == "figure"
        ]
        self.assertTrue(figures)
        for figure in figures:
            asset = ROOT / "public" / figure["src"].lstrip("/")
            self.assertTrue(asset.exists() and asset.stat().st_size > 1024)
            left, top, right, bottom = figure["source"]["bbox"]
            self.assertLess((right - left) * (bottom - top), 1653 * 2339 * 0.35)

    def test_low_resolution_regions_are_visible_article_level_review_notes(self) -> None:
        expected_titles = {
            3: "2022年供应链及物流合同物流发展研究报告——服装赛道",
            4: "第三季度签约喜讯：又一批服装标杆客户选择了新亦源云仓",
            5: "2023年服装零售行业研究报告",
        }
        for issue, title in expected_titles.items():
            article = json.loads((ROOT / "src/data/whitepapers" / f"{issue}.json").read_text())
            section = next(section for section in article["sections"] if section["title"] == title)
            notes = [block for block in section["blocks"] if block["type"] == "review-note"]
            self.assertEqual(len(notes), 1)
            self.assertIn(f"原刊物理第{section['source']['pdfPage']}页", notes[0]["text"])
            self.assertEqual(notes[0]["source"]["pdfPage"], section["source"]["pdfPage"])
            self.assertEqual(len(notes[0]["source"]["bbox"]), 4)
            self.assertTrue(article["readingNotice"].startswith("本期目前为部分恢复稿"))

    def test_cache_source_mismatch_fails_closed_without_touching_real_cache(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            issue_dir = Path(temporary) / "issue-01"
            issue_dir.mkdir()
            cache_hash = "a" * 64
            (issue_dir / "manifest.json").write_text(json.dumps({
                "issue": 1,
                "sourceSha256": cache_hash,
                "ocrResults": [{"issue": 1, "page": 1, "side": "full", "status": "cached"}],
            }))
            (issue_dir / "page-001.lines.json").write_text(json.dumps({
                "source": {"sha256": cache_hash, "physicalPage": 1, "side": "full"},
                "lines": [],
            }))
            validate_issue_cache(1, cache_hash, Path(temporary))
            with self.assertRaisesRegex(RuntimeError, "hash does not match"):
                validate_issue_cache(1, "b" * 64, Path(temporary))
            (issue_dir / "page-001.lines.json").write_text(json.dumps({
                "source": {"sha256": cache_hash, "physicalPage": 2, "side": "full"},
                "lines": [],
            }))
            with self.assertRaisesRegex(RuntimeError, "source identity mismatch"):
                validate_issue_cache(1, cache_hash, Path(temporary))


if __name__ == "__main__":
    unittest.main()
