import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class ConvertIssueContractTest(unittest.TestCase):
    def test_issue_14_manifest_has_verified_boundaries_and_space_ordering(self):
        subprocess.run([sys.executable, str(ROOT / 'scripts/whitepapers/convert_issue.py')], cwd=ROOT, check=True)
        manifest = json.loads((ROOT / 'src/data/whitepapers/14.json').read_text(encoding='utf-8'))
        self.assertEqual([section['source']['printedPage'] for section in manifest['sections']], [2, 3, 8, 14, 20, 23, 27, 29, 31, 33, 35, 37])
        self.assertEqual(len(manifest['sections']), 12)
        text = '\n'.join(block.get('text', '') for section in manifest['sections'] for block in section['blocks'])
        self.assertIn('过去几年，鞋服行业持续处于高频上新、快速迭代和竞争加剧的环境中', text)
        self.assertIn('随着中国服装品牌加速出海', text)
        self.assertIn('数字100', text)
        self.assertNotIn('数字1 0 0', text)
        self.assertGreater(sum(block['type'] == 'subheading' for section in manifest['sections'] for block in section['blocks']), 12)

        export = '\n'.join(block.get('text', '') for block in manifest['sections'][1]['blocks'])
        self.assertLess(export.index('形势综述'), export.index('贸易数据'))
        self.assertLess(export.index('贸易数据'), export.index('市场分析'))

        college = '\n'.join(block.get('text', '') for block in manifest['sections'][11]['blocks'])
        self.assertLess(college.index('在供需见面会前夕'), college.index('6月16日'))
        self.assertLess(college.index('6月16日'), college.index('此次合作与专场招聘'))

        figures = [block for section in manifest['sections'] for block in section['blocks'] if block['type'] == 'figure']
        self.assertGreaterEqual(len(figures), 30)
        self.assertTrue(any(block['src'].endswith('/rising-star-roster.png') for block in figures))
        self.assertGreaterEqual(sum('/awards-' in block['src'] for block in figures), 6)
        for section in manifest['sections']:
            for block in section['blocks']:
                bbox = block['source'].get('bbox')
                if bbox is None:
                    continue
                self.assertEqual(len(bbox), 4)
                self.assertGreaterEqual(min(bbox), 0)
                self.assertGreater(bbox[2], bbox[0])
                self.assertGreater(bbox[3], bbox[1])
                self.assertLessEqual(bbox[2], 1207.56)
                self.assertLessEqual(bbox[3], 824.88)


if __name__ == '__main__':
    unittest.main()
