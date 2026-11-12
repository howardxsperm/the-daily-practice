#!/usr/bin/env python3
"""Convert a DRM-free EPUB into a plain TXT file for The Daily Practice.

Standard-library only. Preserves EPUB spine reading order. Not an EPUB renderer.
Usage: python tools/epub_to_txt.py mybook.epub [output.txt]
"""
import argparse
import posixpath
import re
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree as ET


class TextExtractor(HTMLParser):
    BREAKS = {"p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "br", "blockquote", "section", "article"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.suppressed = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "svg"}:
            self.suppressed += 1
        elif self.suppressed == 0 and tag in self.BREAKS:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"script", "style", "svg"}:
            self.suppressed = max(0, self.suppressed - 1)
        elif self.suppressed == 0 and tag in self.BREAKS:
            self.parts.append("\n\n" if tag in {"p", "h1", "h2", "h3", "blockquote"} else "\n")

    def handle_data(self, text):
        if self.suppressed == 0:
            self.parts.append(text)

    def get_text(self):
        raw = "".join(self.parts).replace("\u00a0", " ")
        raw = re.sub(r"[ \t]+", " ", raw)
        raw = re.sub(r" *\n *", "\n", raw)
        return re.sub(r"\n{3,}", "\n\n", raw).strip()


def convert(src: Path, dest: Path):
    if src.suffix.lower() != ".epub":
        raise ValueError("Input must be a .epub file")
    with zipfile.ZipFile(src) as z:
        if "META-INF/encryption.xml" in z.namelist():
            print("Warning: This EPUB includes encryption metadata; DRM-protected content cannot be converted.")
        container = ET.fromstring(z.read("META-INF/container.xml"))
        rootfile = next((n.attrib.get("full-path") for n in container.iter() if n.tag.endswith("rootfile")), None)
        if not rootfile:
            raise ValueError("No OPF rootfile found")
        package = ET.fromstring(z.read(rootfile))
        manifest = {n.attrib.get("id"): n.attrib.get("href") for n in package.iter() if n.tag.endswith("item")}
        spine = [n.attrib.get("idref") for n in package.iter() if n.tag.endswith("itemref")]
        base = posixpath.dirname(rootfile)
        pieces = []
        for item_id in spine:
            href = manifest.get(item_id)
            if not href:
                continue
            path = posixpath.normpath(posixpath.join(base, href.split("#")[0]))
            if not path.lower().endswith((".html", ".htm", ".xhtml")):
                continue
            try:
                raw = z.read(path).decode("utf-8-sig", errors="replace")
            except KeyError:
                continue
            parser = TextExtractor()
            parser.feed(raw)
            content = parser.get_text()
            if content:
                pieces.append(content)
    if not pieces:
        raise ValueError("No readable chapters found; file may be encrypted or malformed")
    dest.write_text("\n\n----- chapter break -----\n\n".join(pieces) + "\n", encoding="utf-8")
    return len(pieces)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("epub", type=Path, help="DRM-free EPUB file")
    ap.add_argument("output", type=Path, nargs="?", help="TXT output (defaults to same basename)")
    args = ap.parse_args()
    out = args.output or args.epub.with_suffix(".txt")
    count = convert(args.epub, out)
    print(f"Saved {out} ({count} chapter files)")
