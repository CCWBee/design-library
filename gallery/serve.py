#!/usr/bin/env python3
"""Local, self-updating design library gallery server.

Standard library only. Scans the design/ library live on every /api/index
request so a browser reload always reflects what is on disk. See
gallery/CONTRACT.md for the full build contract.
"""

import argparse
import json
import os
import sys
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

# ROOT is the design/ directory (parent of this gallery/ folder). Never serve
# anything outside it.
ROOT = Path(__file__).resolve().parent.parent
GALLERY = ROOT / "gallery"
PUBLIC = GALLERY / "public"
ONTOLOGY_DIR = ROOT / "ontology"
ONTOLOGY_FILE = ONTOLOGY_DIR / "assets.json"
CATALOGUE_FILE = ROOT / "effects" / "catalogue.md"

# Content types used when serving files under /files/. Code files are handed
# back as text/plain so they can be fetched and shown rather than run.
FILE_CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".htm": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".css": "text/plain; charset=utf-8",
    ".tsx": "text/plain; charset=utf-8",
    ".ts": "text/plain; charset=utf-8",
    ".jsx": "text/plain; charset=utf-8",
    ".swift": "text/plain; charset=utf-8",
    ".md": "text/plain; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
}

# Content types for the gallery's own static assets under /public/. Here CSS
# and JS keep their real types so the page renders and runs.
PUBLIC_CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
}

# Scan sets: (glob relative to ROOT, category, kind, renderable).
SCAN_SETS = [
    ("effects/extracts/*.html", "effects", "html", True),
    ("effects/extracts/components/*.html", "components", "html", True),
    ("patterns/ai-native/*.tsx", "ai-native", "tsx", False),
    ("patterns/ai-native/primitives/*.tsx", "ai-native", "tsx", False),
    ("patterns/ai-native/primitives/*.css", "ai-native", "css", False),
    ("glass/liquid-glass/apple/**/*.swift", "apple", "swift", False),
    ("effects/transitions/*.html", "transitions", "html", True),
    ("effects/aceternity/**/*.tsx", "aceternity", "tsx", False),
    ("minimal/scandinavian/**/*.css", "scandinavian", "css", False),
    ("minimal/scandinavian/**/*.js", "scandinavian", "js", False),
    ("minimal/scandinavian/**/*.html", "scandinavian", "html", True),
    ("**/*.md", "docs", "md", False),
]

# Category display order and labels. Most curatable first.
CATEGORY_ORDER = [
    ("components", "Components"),
    ("effects", "Effects"),
    ("apple", "Apple"),
    ("ai-native", "AI-native"),
    ("transitions", "Transitions"),
    ("aceternity", "Aceternity"),
    ("scandinavian", "Scandinavian"),
    ("docs", "Docs"),
]


def is_skipped(rel_posix: str, name: str) -> bool:
    """Files the contract says never to scan."""
    if name == "three.min.js":
        return True
    if name.startswith("_"):
        return True
    if rel_posix == "gallery" or rel_posix.startswith("gallery/"):
        return True
    if rel_posix == "glass/liquid-glass/apple/README.md":
        return True
    if rel_posix.startswith("effects/transitions/skill/"):
        return True  # snippet docs for the transitions skill, not library reference docs
    return False


def is_excluded_static(rel_posix: str) -> bool:
    """Paths that are not published to the static GitHub Pages build."""
    if rel_posix.startswith("glass/liquid-glass/apple/"):
        return True
    if rel_posix == "glass/bible-full.md":
        return True
    if rel_posix.startswith("effects/aceternity/"):
        return True  # licence forbids redistribution; local only
    if rel_posix.startswith("ontology/component-gallery/"):
        return True  # unlicensed scrape; local only
    return False


def humanise(name: str) -> str:
    """Hyphens (and underscores) to spaces, first letter upper."""
    text = name.replace("-", " ").replace("_", " ").strip()
    if not text:
        return name
    return text[0].upper() + text[1:]


def apple_subgroup(rel_posix: str) -> str:
    """Framework folder for an apple swift file.

    Files directly under apple/ are the guide; files under apple/api/<fw>/...
    take <fw> as their subgroup.
    """
    prefix = "glass/liquid-glass/apple/"
    tail = rel_posix[len(prefix):] if rel_posix.startswith(prefix) else rel_posix
    parts = tail.split("/")
    if len(parts) >= 3 and parts[0] == "api":
        return parts[1]
    return "guide"


def load_ontology():
    """Return (raw_ontology_dict, file_to_cell_map).

    The map inverts assets.json into a lookup from a ROOT-relative posix path
    to its cell meta. assets.json file entries are written relative to the
    ontology/ folder (for example ../effects/extracts/foo.html), so each is
    resolved against ONTOLOGY_DIR and then made relative to ROOT.
    """
    try:
        with open(ONTOLOGY_FILE, "r", encoding="utf-8") as handle:
            ontology = json.load(handle)
    except (OSError, ValueError):
        return None, {}

    file_map = {}
    for family in ontology.get("families", []):
        family_name = family.get("family")
        for type_entry in family.get("types", []):
            type_name = type_entry.get("type")
            for register, cell in (type_entry.get("cells") or {}).items():
                status = cell.get("status") if isinstance(cell, dict) else None
                files = cell.get("files", []) if isinstance(cell, dict) else []
                for raw in files:
                    key = normalise_ontology_path(raw)
                    if key is None or key in file_map:
                        # First occurrence wins, keeping the mapping deterministic.
                        continue
                    file_map[key] = {
                        "family": family_name,
                        "type": type_name,
                        "register": register,
                        "status": status,
                    }
    return ontology, file_map


def load_catalogue_themes():
    """Map an effect name to the catalogue.md theme heading it sits under.

    Parses each '## <Theme>' section of effects/catalogue.md and the table of
    names beneath it, returning {name: theme}. The name is the first token of a
    table row's first cell, with any leading bullet stripped (for example
    '● liquid-form' -> 'liquid-form', 'portal-field (AEON)' ->
    'portal-field'). A missing or unreadable catalogue degrades to an empty map,
    so effects fall back to the generic 'Effects' group rather than failing.
    """
    themes = {}
    try:
        with open(CATALOGUE_FILE, "r", encoding="utf-8") as handle:
            lines = handle.read().splitlines()
    except (OSError, ValueError):
        return themes

    current = None
    for line in lines:
        if line.startswith("## "):
            current = line[3:].strip()
            continue
        if current and line.lstrip().startswith("|"):
            first = line.strip().strip("|").split("|")[0].strip()
            if not first:
                continue
            if first.lower().startswith("name"):
                continue
            if set(first) <= set("-: "):  # table divider row
                continue
            name = first.replace("●", "").strip().split(" ")[0]
            if name:
                themes.setdefault(name, current)
    return themes


def group_for(item, catalogue_themes) -> str:
    """The display group an item belongs to.

    components -> the Title-cased ontology family from its meta (Actions,
    Inputs, ...); effects -> the catalogue theme heading its name sits under,
    else 'Effects'; ai-native -> 'AI-native'; apple -> 'Apple'; docs -> 'Docs'.
    """
    category = item["category"]
    if category == "components":
        meta = item.get("meta") or {}
        family = meta.get("family")
        return family.title() if family else "Components"
    if category == "effects":
        return catalogue_themes.get(item["name"], "Effects")
    rel = item.get("relpath", "")
    if category == "ai-native":
        return "AI-native primitives" if "/primitives/" in rel else "AI-native"
    if category == "transitions":
        return "Transitions"
    if category == "aceternity":
        return "Aceternity"
    if category == "scandinavian":
        if "/demos/" in rel:
            return "Scandinavian demos"
        if "/scripts/" in rel:
            return "Scandinavian scripts"
        return "Scandinavian site"
    if category == "apple":
        return "Apple"
    if category == "docs":
        return "Docs"
    return category


def normalise_ontology_path(raw: str):
    """Resolve an assets.json file entry to a ROOT-relative posix string."""
    try:
        resolved = (ONTOLOGY_DIR / raw).resolve()
        rel = resolved.relative_to(ROOT)
    except (ValueError, OSError):
        return None
    return rel.as_posix()


def file_url_for(rel_posix: str, mode: str) -> str:
    """Where an item's asset lives, by build mode.

    'server': served live by this process at /files/<relpath>.
    'static': a path relative to gallery/public/ so it resolves to the repo
    asset on GitHub Pages (public/ is two levels below the design root).
    """
    if mode == "static":
        return "../../" + rel_posix
    return "/files/" + rel_posix


def build_item(path: Path, category: str, kind: str, renderable: bool, file_map, mode: str, catalogue_themes):
    rel = path.relative_to(ROOT)
    rel_posix = rel.as_posix()
    name = path.stem
    stat = path.stat()
    mtime = datetime.fromtimestamp(stat.st_mtime).replace(microsecond=0).isoformat()

    if category == "apple":
        title = name
        subgroup = apple_subgroup(rel_posix)
    else:
        title = humanise(name)
        subgroup = None

    item = {
        "id": f"{category}/{name}",
        "name": name,
        "title": title,
        "category": category,
        "subgroup": subgroup,
        "relpath": rel_posix,
        "fileUrl": file_url_for(rel_posix, mode),
        "kind": kind,
        "renderable": renderable,
        "size": stat.st_size,
        "mtime": mtime,
        "meta": file_map.get(rel_posix),
    }
    item["group"] = group_for(item, catalogue_themes)
    return item


def build_index(mode: str):
    """Walk every scan set and return the full API document.

    mode='server': each item's fileUrl is /files/<relpath> and every file is
    included; this is what /api/index returns.
    mode='static': each item's fileUrl is ../../<relpath> (relative to
    gallery/public/, so it resolves to the repo asset on GitHub Pages), and the
    two unpublished paths are excluded (anything under glass/liquid-glass/apple/
    and the file glass/bible-full.md).
    """
    ontology, file_map = load_ontology()
    catalogue_themes = load_catalogue_themes()

    items = []
    seen = set()
    for glob_pattern, category, kind, renderable in SCAN_SETS:
        for path in sorted(ROOT.glob(glob_pattern)):
            if not path.is_file():
                continue
            rel_posix = path.relative_to(ROOT).as_posix()
            if is_skipped(rel_posix, path.name):
                continue
            if mode == "static" and is_excluded_static(rel_posix):
                continue
            if rel_posix in seen:
                continue
            seen.add(rel_posix)
            items.append(build_item(path, category, kind, renderable, file_map, mode, catalogue_themes))

    counts = {}
    for _, category, _, _ in SCAN_SETS:
        counts.setdefault(category, 0)
    for item in items:
        counts[item["category"]] = counts.get(item["category"], 0) + 1

    categories = [
        {"id": cid, "label": label, "count": counts.get(cid, 0)}
        for cid, label in CATEGORY_ORDER
    ]

    return {
        "generatedAt": datetime.now().replace(microsecond=0).isoformat(),
        "counts": counts,
        "categories": categories,
        "items": items,
        "ontology": ontology,
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "DesignGallery/1.0"

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def do_GET(self):
        path = unquote(urlparse(self.path).path)

        if path == "/":
            self.serve_local_file(PUBLIC / "index.html", PUBLIC_CONTENT_TYPES)
            return
        if path == "/api/index":
            self.serve_api_index()
            return
        if path.startswith("/files/"):
            self.serve_files(path[len("/files/"):])
            return

        # public/ is the web root, so any other path is one of its static
        # assets (styles.css, app.js, index.json, ...). The same sibling
        # relative paths then resolve both here and on GitHub Pages.
        self.serve_public(path.lstrip("/"))

    def serve_api_index(self):
        try:
            document = build_index("server")
        except Exception as exc:  # keep the server alive on a scan error
            self.send_json({"error": "scan failed", "detail": str(exc)}, status=500)
            return
        body = json.dumps(document).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def serve_public(self, rel: str):
        target = self.safe_join(PUBLIC, rel)
        if target is None:
            self.send_json({"error": "forbidden"}, status=403)
            return
        self.serve_local_file(target, PUBLIC_CONTENT_TYPES)

    def serve_files(self, rel: str):
        target = self.safe_join(ROOT, rel)
        if target is None:
            self.send_json({"error": "forbidden", "path": rel}, status=403)
            return
        self.serve_local_file(target, FILE_CONTENT_TYPES)

    def safe_join(self, base: Path, rel: str):
        """Resolve rel under base, refusing anything that escapes base."""
        rel = rel.replace("\\", "/").lstrip("/")
        try:
            target = (base / rel).resolve()
            base_resolved = base.resolve()
        except (OSError, ValueError):
            return None
        if not target.is_relative_to(base_resolved):
            return None
        return target

    def serve_local_file(self, target: Path, content_types):
        if not target.is_file():
            self.send_json({"error": "not found"}, status=404)
            return
        content_type = content_types.get(
            target.suffix.lower(), "application/octet-stream"
        )
        try:
            data = target.read_bytes()
        except OSError:
            self.send_json({"error": "unreadable"}, status=500)
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Serve the design library gallery.")
    default_port = int(os.environ.get("GALLERY_PORT", "8770"))
    parser.add_argument("--port", type=int, default=default_port,
                        help="Port to bind on 127.0.0.1 (default 8770 or $GALLERY_PORT).")
    parser.add_argument("--no-open", action="store_true",
                        help="Do not open a browser on start.")
    parser.add_argument("--build", action="store_true",
                        help="Write public/index.json (the static manifest) and exit; do not serve.")
    args = parser.parse_args(argv)

    if args.build:
        manifest = PUBLIC / "index.json"
        document = build_index("static")
        with open(manifest, "w", encoding="utf-8") as handle:
            handle.write(json.dumps(document))
        print(f"Wrote {manifest}")
        print(f"{len(document['items'])} items")
        return 0

    address = ("127.0.0.1", args.port)
    httpd = ThreadingHTTPServer(address, Handler)
    url = f"http://127.0.0.1:{args.port}/"

    print(f"Design gallery serving {ROOT}")
    print(f"Open {url}")
    if not args.no_open:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
