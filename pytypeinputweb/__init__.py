import re
from pathlib import Path

_STATIC_DIR = Path(__file__).parent / "static"
_CSS_DIR = _STATIC_DIR / "css"

_VAR_DEF_RE = re.compile(r"(--pti-[\w-]+)\s*:\s*([^;]+);")


def get_js() -> str:
    """Return the full JS component as a single string, ready to embed in a <script> tag or .js file."""
    js_files = sorted(_STATIC_DIR.glob("*.js"))
    core = _STATIC_DIR / "core.js"
    parts = []
    for f in js_files:
        if f != core:
            parts.append(f.read_text(encoding="utf-8"))
    if core.exists():
        parts.append(core.read_text(encoding="utf-8"))
    return "(()=>{\n" + "\n".join(parts) + "\n})();"


def get_css() -> str:
    """Return the full CSS as a single string, ready to embed in a <style> tag or .css file."""
    parts = [f.read_text(encoding="utf-8") for f in _CSS_DIR.glob("*.css")]
    return "\n".join(parts)


def list_css_variables() -> dict[str, str]:
    """Return a dict of all ``--pti-*`` CSS custom properties defined in the stylesheets.

    Keys are variable names (e.g. ``--pti-font-size-base``),
    values are their declared values (e.g. ``1rem``).
    Only the *last* definition of each variable wins (dark-mode
    overrides inside ``@media`` will replace the light-mode default).
    """
    variables: dict[str, str] = {}
    for css_file in sorted(_CSS_DIR.glob("*.css")):
        text = css_file.read_text(encoding="utf-8")
        for match in _VAR_DEF_RE.finditer(text):
            variables[match.group(1)] = match.group(2).strip()
    return variables