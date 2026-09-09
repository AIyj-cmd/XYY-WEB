#!/usr/bin/env python3
"""Regression checks for the bounded whitepaper reading-image derivation."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "scripts/whitepapers/enhance_reading_images.py"
MANIFEST = ROOT / "src/data/whitepaper-figure-assets.json"


def load_script():
    spec = importlib.util.spec_from_file_location("reading_images", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class ReadingImageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.module = load_script()
        cls.manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    def test_manifest_has_only_declared_source_paths_and_real_dimensions(self) -> None:
        plan = self.module.validate_plan()
        self.module.check_manifest(plan, self.manifest)
        self.assertEqual(set(self.manifest), {spec.original_src for spec in plan})
        for source, asset in self.manifest.items():
            self.assertTrue(asset["src"].startswith("/images/supply-chain-whitepapers/"), source)
            self.assertLessEqual(asset["displayWidth"], 768, source)
            self.assertEqual(
                self.module.image_dimensions(ROOT / "public" / asset["src"].lstrip("/")),
                (asset["width"], asset["height"]),
            )

    def test_check_command_is_reproducible(self) -> None:
        result = subprocess.run([sys.executable, str(SCRIPT), "--check"], cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Validated", result.stdout)

    def test_sha_failure_is_explicit(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            altered = Path(directory) / "source.pdf"
            altered.write_bytes(b"not the audited PDF")
            self.assertNotEqual(self.module.sha256(altered), "0" * 64)
            with self.assertRaises(ValueError):
                self.module.require_expected_sha(altered, "0" * 64)

    def test_out_of_range_bbox_is_explicit(self) -> None:
        with self.assertRaises(ValueError):
            self.module.validate_bbox([0, 0, 1208, 10], 1207.56, 824.88)


if __name__ == "__main__":
    unittest.main()
