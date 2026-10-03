#!/usr/bin/env python3
"""Build the site: wrap each page in src/pages/ with the shared head, header
and footer from src/partials/, write it to the repo root, and write
sitemap.xml from the same page list.  Run after any edit:  python3 build.py

Each page starts with a front-matter block:
  ---
  title: ...
  description: ...
  page: services        (the nav item to mark as current; "home" for none)
  body: page            (class on <body>)
  ---
"""
from pathlib import Path
import re

ROOT = Path(__file__).parent
SRC = ROOT / "src"
BASE = "https://aldy-lab.github.io/bravo/"

# (file, nav key, label, bearing on the board)
NAV = [
    ("services.html", "services", "Services", "000"),
    ("projects.html", "projects", "Projects", "090"),
    ("careers.html", "careers", "Careers", "180"),
    ("contact.html", "contact", "Contact", "270"),
]
PAGES = ["index.html"] + [n[0] for n in NAV]
VARIANTS = ["plot.html", "minimal.html", "te.html", "industrial.html"]  # alternative heroes: built, but kept out of the sitemap and search


def part(name):
    return (SRC / "partials" / name).read_text()


def nav_html(current):
    items = []
    for href, key, label, brg in NAV:
        cur = ' aria-current="page"' if key == current else ""
        items.append(f'<li><a href="{href}"{cur}><span class="tabs__brg">{brg}</span>{label}</a></li>')
    return "\n        ".join(items)


def build():
    for name in PAGES + VARIANTS:
        raw = (SRC / "pages" / name).read_text()
        m = re.match(r"---\n(.*?)\n---\n", raw, re.S)
        meta = dict(line.split(": ", 1) for line in m.group(1).splitlines())
        body = raw[m.end():]
        url = BASE + ("" if name == "index.html" else name)
        html = (
            part("head.html")
            .replace("{{title}}", meta["title"])
            .replace("{{description}}", meta["description"])
            .replace("{{url}}", url)
            .replace("{{body}}", meta.get("body", "page"))
            .replace("{{robots}}", '<meta name="robots" content="noindex">' if name in VARIANTS else "")
            + part("sprite.html")
            + part("header.html").replace("{{nav}}", nav_html(meta.get("page", "")))
            + body
            + part("footer.html").replace("{{nav}}", nav_html(meta.get("page", "")))
        )
        (ROOT / name).write_text(html)
        print("wrote", name)

    urls = "\n".join(f"  <url><loc>{BASE}{'' if p == 'index.html' else p}</loc></url>" for p in PAGES)
    (ROOT / "sitemap.xml").write_text(
        f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n'
    )
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {BASE}sitemap.xml\n")
    print("wrote sitemap.xml, robots.txt")


if __name__ == "__main__":
    build()
