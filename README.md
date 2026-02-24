# PyTypeInputWeb 1.0.0

[![PyPI version](https://img.shields.io/pypi/v/pytypeinputweb)](https://pypi.org/project/pytypeinputweb/)
[![Python](https://img.shields.io/pypi/pyversions/pytypeinputweb)](https://pypi.org/project/pytypeinputweb/)
[![License](https://img.shields.io/pypi/l/pytypeinputweb)](https://pypi.org/project/pytypeinputweb/)

**Auto-generated HTML forms from [PyTypeInput](https://github.com/offerrall/pytypeinput) metadata.**

PyTypeInputWeb is a zero-dependency JavaScript + CSS form renderer that takes the JSON output of PyTypeInput and builds fully functional, validated forms in the browser.

> For live examples and full integration, see [**FuncToWeb**](https://github.com/offerrall/functoweb) — which uses PyTypeInputWeb to render forms automatically from Python functions.

---

## Quick Example

```python
import json
from pytypeinput import analyze_function
from pytypeinputweb import get_js, get_css

def create_user(name: str, age: int = 25):
    ...

params = analyze_function(create_user)
params_json = json.dumps([p.to_dict() for p in params])

html = f"""
<style>{get_css()}</style>
<pti-form params='{params_json}'></pti-form>
<script>
{get_js()}
document.querySelector("pti-form").addEventListener("submit", (e) => {{
    console.log("Submitted:", e.detail);
}});
</script>
"""
```

The `<pti-form>` custom element handles rendering, validation, submission, and reset automatically.

---

## Installation

```bash
pip install pytypeinputweb
```

---

## Dependencies

- **Python** 3.10+
- No JavaScript dependencies — everything is self-contained

---

## API

### Python

```python
from pytypeinputweb import get_js, get_css, list_css_variables
```

| Function | Returns |
|---|---|
| `get_js()` | Complete JS as a string, ready for a `<script>` tag or saved to a file |
| `get_css()` | Complete CSS as a string, ready for a `<style>` tag or saved to a file |
| `list_css_variables()` | Dict of all `--pti-*` CSS custom properties and their values |

### JavaScript

#### `<pti-form>` Custom Element

```html
<pti-form id="my-form"></pti-form>
```

| Method | Description |
|---|---|
| `load(params)` | Render form from a list of `ParamMetadata.to_dict()` objects |
| `getValues()` | Returns current form values as `{ name: value }` |
| `reset()` | Reset all fields to their initial state |

#### Events

```javascript
const form = document.getElementById("my-form");

form.addEventListener("change", (e) => {
    console.log("Current values:", e.detail);
});

form.addEventListener("submit", (e) => {
    console.log("Submitted:", e.detail);
});

form.addEventListener("reset", () => {
    console.log("Form was reset");
});
```

---

## Supported Widgets

Every widget type from PyTypeInput is rendered automatically:

| Widget | Renders as |
|---|---|
| `Text` | Text input with optional `maxLength` |
| `Number` | Numeric input with step buttons and constraints |
| `Checkbox` | Toggle switch |
| `Date` | Native date picker |
| `Time` | Native time picker |
| `Slider` | Range slider with optional value display |
| `Password` | Password input with show/hide toggle |
| `Textarea` | Multiline text with configurable rows |
| `Dropdown` | Select with options |
| `Color` | Native color picker with hex display |
| `Email` | Text input with email pattern validation |
| `ImageFile`, `VideoFile`, `AudioFile`, `DataFile`, `TextFile`, `DocumentFile`, `File` | File input with drag & drop, filtered by extensions |

---

## Features

### Validation

Every field validates in real-time based on PyTypeInput metadata. The submit button stays disabled until all visible fields are valid. Validation includes constraints (`ge`, `le`, `min_length`, `max_length`, `pattern`), required fields, and type-specific rules.

### Optional Fields

Fields with `optional` metadata render with a toggle switch. When toggled off, the field is hidden and excluded from form values. The toggle's initial state matches `optional.enabled` from the metadata.

### Lists

List fields render as dynamic item collections with add/remove buttons. Length constraints (`min_length`, `max_length`) control the minimum and maximum number of items. Each item renders using the appropriate widget for its type.

### File Inputs

File widgets support drag & drop, extension filtering based on the pattern constraint, and file list management for list types. Each file shows its name and size with a remove button.

### Reset

The reset button (and `reset()` method) restore the form to its initial state, including defaults, toggle states, and list items.

### Theming

All visual properties are defined as CSS custom properties (`--pti-*`). Use `list_css_variables()` to inspect every available variable and override them to customize the look and feel:

```python
from pytypeinputweb import list_css_variables

for name, value in list_css_variables().items():
    print(f"{name}: {value}")
```

To override, add your own CSS after the default stylesheet:

```css
:root {
    --pti-radius-base: 0px;
    --pti-submit-bg-light: #10b981;
    --pti-submit-hover-light: #059669;
}
```

---

## License

MIT