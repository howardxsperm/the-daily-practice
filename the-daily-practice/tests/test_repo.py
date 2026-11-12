"""Offline, dependency-free checks. No user ebook or hardware required."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class RepoTests(unittest.TestCase):
    def test_dashboard_assets_and_code_exist(self):
        html = (ROOT / "dashboard/index.html").read_text(encoding="utf-8")
        self.assertIn('src="app.js"', html)
        self.assertIn('href="style.css"', html)
        self.assertTrue((ROOT / "dashboard/app.js").is_file())
        self.assertTrue((ROOT / "dashboard/style.css").is_file())
        self.assertTrue(any((ROOT / "dashboard/assets").glob("*.jpg")))

    def test_koreader_plugin_opt_in_is_off(self):
        plugin = (ROOT / "integrations/koreader/dailypractice.koplugin/main.lua").read_text()
        self.assertIn("local ENABLE_EXPERIMENTAL_PLUGIN = false", plugin)
        self.assertIn("return { disabled = true }", plugin)
        self.assertIn("dailypractice_reading.tsv", plugin)
        self.assertTrue((ROOT / "integrations/koreader/dailypractice.koplugin/_meta.lua").is_file())

    def test_no_user_data_included(self):
        prohibited = {'.epub', '.pdf', '.sqlite', '.sqlite3', '.db', '.azw3', '.mobi', '.kfx'}
        found = [str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in prohibited]
        self.assertFalse(found, found)

    def test_epub_conversion_synthetic_fixture(self):
        tool = ROOT / "dashboard/tools/epub_to_txt.py"
        spec = importlib.util.spec_from_file_location("epub_to_txt",tool)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            epub = base / "demo.epub"
            output = base / "demo.txt"
            with zipfile.ZipFile(epub, 'w') as z:
                z.writestr('META-INF/container.xml', '<container><rootfiles><rootfile full-path="OEBPS/book.opf"/></rootfiles></container>')
                z.writestr('OEBPS/book.opf', '<package><manifest><item id="one" href="a.xhtml"/><item id="two" href="b.xhtml"/></manifest><spine><itemref idref="one"/><itemref idref="two"/></spine></package>')
                z.writestr('OEBPS/a.xhtml', '<html><body><h1>chapter one</h1><p>Hello &amp; welcome.</p></body></html>')
                z.writestr('OEBPS/b.xhtml', '<html><body><p>Second chapter.</p></body></html>')
            count = mod.convert(epub, output)
            text = output.read_text(encoding='utf-8')
            self.assertEqual(count,2)
            self.assertIn('Hello & welcome.',text)
            self.assertIn('Second chapter.',text)
            self.assertLess(text.index('chapter one'),text.index('Second chapter.'))

if __name__ == "__main__":
    unittest.main()
