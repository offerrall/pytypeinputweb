import json
import webbrowser
from typing import Callable, Any
import socket

from pytypeinput import analyze_function
from pytypeinput.validate import validate_value
from pytypeinputweb import get_js, get_css


def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def show(func: Callable[..., Any], title: str = "PTI Form", port: int = 8000) -> None:
    try:
        from fastapi import FastAPI, Request
        from fastapi.responses import HTMLResponse, JSONResponse
        import uvicorn
    except ImportError:
        raise ImportError("FastAPI and uvicorn are required. Install with: pip install fastapi uvicorn")

    params = analyze_function(func)
    params_json = json.dumps([p.to_dict() for p in params])
    params_by_name = {p.name: p for p in params}

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
body {{ background: #1a1a1a; padding: 2rem; max-width: 600px; margin: 0 auto; }}
{get_css()}
</style>
</head>
<body>
<pti-form params='{params_json}'></pti-form>
<script>
{get_js()}

function serializeValue(v) {{
    if (v instanceof File) return v.name;
    if (Array.isArray(v)) return v.map(serializeValue);
    return v;
}}

document.querySelectorAll("pti-form").forEach((form) => {{
    form.addEventListener("submit", (e) => {{
        const values = {{}};
        for (const [k, v] of Object.entries(e.detail)) {{
            values[k] = serializeValue(v);
        }}
        fetch("/submit", {{
            method: "POST",
            headers: {{ "Content-Type": "application/json" }},
            body: JSON.stringify({{
                form_id: form.getAttribute("form-id"),
                values: values
            }})
        }});
    }});
}});
</script>
</body>
</html>"""

    app = FastAPI()

    @app.get("/", response_class=HTMLResponse)
    async def root():
        return html

    @app.post("/submit")
    async def submit(request: Request):
        data = await request.json()
        values = data.get("values", {})

        validated = {}
        errors = {}

        for name, raw_value in values.items():
            meta = params_by_name.get(name)
            if meta is None:
                errors[name] = f"Unknown parameter: {name}"
                continue
            try:
                validated[name] = validate_value(meta, raw_value)
            except (ValueError, TypeError) as e:
                errors[name] = str(e)

        if errors:
            print(f"\n[pti-form] validation errors:")
            for name, err in errors.items():
                print(f"  {name}: {err}")
            return JSONResponse({"ok": False, "errors": errors}, status_code=422)

        print(f"\n[pti-form] validated: {json.dumps({k: repr(v) for k, v in validated.items()}, indent=2)}")
        return JSONResponse({"ok": True})

    local_ip = get_local_ip()

    print(f"\n{'='*60}")
    print(f"  PTI Form Server Running")
    print(f"{'='*60}")
    print(f"  Desktop: http://localhost:{port}")
    print(f"  Mobile:  http://{local_ip}:{port}")
    print(f"{'='*60}\n")

    webbrowser.open(f"http://localhost:{port}")

    uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")