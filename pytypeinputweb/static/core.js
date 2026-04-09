function isFieldEnabled(f) {
    return !f.toggle || f.toggle.checked;
}

function getFormValues(fields) {
    const values = {};
    for (const f of fields) {
        if (!isFieldEnabled(f)) continue;
        values[f.param.name] = f.input.getValue();
    }
    return values;
}

function revalidateForm(fields, submitBtn) {
    let allValid = true;

    for (const f of fields) {
        if (!isFieldEnabled(f)) continue;

        const isList = f.param.list != null && f.param.special_widget !== "File";

        try {
            f.input.validate();
            f.errorEl.hidden = true;
            f.asterisk.hidden = true;
            f.input.classList.remove("pti-input-error");
        } catch (e) {
            if (e.message === "Required") {
                f.asterisk.hidden = false;
                if (!isList) {
                    f.errorEl.hidden = true;
                    f.input.classList.remove("pti-input-error");
                } else {
                    f.errorEl.hidden = true;
                }
            } else {
                f.asterisk.hidden = true;
                if (isList) {
                    f.errorEl.hidden = true;
                } else {
                    f.errorEl.textContent = e.message;
                    f.errorEl.hidden = false;
                    f.input.classList.add("pti-input-error");
                }
            }
            allValid = false;
        }
    }

    submitBtn.disabled = !allValid;
    return allValid;
}

function getRenderer(param) {
    const sw = param.special_widget;
    if (sw === "Color") return renderColor;
    if (sw === "File") return renderFile;
    if (param.choices) return renderChoice;

    const renderers = {
        int: renderInt,
        float: renderFloat,
        bool: renderBool,
        str: renderStr,
        time: renderTime,
        date: renderDate,
    };
    return renderers[param.param_type];
}

function loadForm(container, formId, params) {
    const fields = [];
    container.innerHTML = "";

    for (const param of params) {
        const fieldId = `${formId}--${param.name}`;
        const renderer = getRenderer(param);
        if (!renderer) continue;

        const field = createField(param, fieldId, renderer);

        field.input.addEventListener("input", () => {
            revalidateForm(fields, submitBtn);
            container.dispatchEvent(new CustomEvent("change", { detail: getFormValues(fields) }));
        });

        fields.push(field);
        container.appendChild(field.wrapper);
    }

    const btnContainer = document.createElement("div");
    btnContainer.className = "pti-buttons";

    const submitBtn = document.createElement("button");
    submitBtn.className = "pti-submit";
    submitBtn.textContent = fields.length === 0 ? "Reload" : "Submit";
    submitBtn.type = "button";
    submitBtn.disabled = true;
    submitBtn.addEventListener("click", () => {
        const values = getFormValues(fields);
        container.dispatchEvent(new CustomEvent("submit", { detail: values }));
    });

    btnContainer.appendChild(submitBtn);

    if (fields.length > 0) {
        const resetBtn = document.createElement("button");
        resetBtn.className = "pti-reset";
        resetBtn.textContent = "Reset";
        resetBtn.type = "button";
        resetBtn.addEventListener("click", () => {
            container.dispatchEvent(new CustomEvent("reset"));
            const freshParams = JSON.parse(JSON.stringify(params));
            const newFields = loadForm(container, formId, freshParams);
            if (container._ptiUpdateFields) {
                container._ptiUpdateFields(newFields);
            }
        });
        btnContainer.appendChild(resetBtn);
    }
    container.appendChild(btnContainer);

    for (const f of fields) {
        if (f.toggle) {
            f.toggle.addEventListener("change", () => {
                revalidateForm(fields, submitBtn);
                container.dispatchEvent(new CustomEvent("change", { detail: getFormValues(fields) }));
            });
        }
    }

    if (fields.length === 0) submitBtn.disabled = false;
    else revalidateForm(fields, submitBtn);
    return fields;
}

function applyPrefill(f, val) {
    const type = f.param.param_type;

    if (f.toggle && val != null) {
        f.toggle.checked = true;
        f.toggle.dispatchEvent(new Event("change"));
    }

    if (type === "bool") {
        const cb = f.wrapper.querySelector('input[type="checkbox"]');
        if (cb) {
            cb.checked = val === true || val === "true";
            cb.dispatchEvent(new Event("change", { bubbles: true }));
        }
    } else if (f.param.special_widget === "Color") {
        const el = f.wrapper.querySelector('input[type="color"]');
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }
    } else if (f.param.choices) {
        const sel = f.wrapper.querySelector("select");
        if (sel) {
            sel.value = String(val);
            sel.dispatchEvent(new Event("input", { bubbles: true }));
        }
    } else {
        const el = f.wrapper.querySelector(
            'input[type="text"], input[type="range"], input[type="date"], input[type="time"], input[type="password"], textarea'
        );
        if (el) {
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
}

function getPrefillFromUrl(params) {
    const search = new URLSearchParams(window.location.search);
    if (!search.size) return {};

    const prefill = {};
    for (const param of params) {
        if (search.has(param.name)) {
            prefill[param.name] = search.get(param.name);
        }
    }
    return prefill;
}

let formCounter = 0;

class PtiForm extends HTMLElement {
    constructor() {
        super();
        this._formId = this.getAttribute("form-id") || `pti-form-${formCounter++}`;
        this.setAttribute("form-id", this._formId);

        this._ptiUpdateFields = (newFields) => {
            this._fields = newFields;
        };
    }

    connectedCallback() {
        const data = this.getAttribute("params");
        if (!data) return;

        const params = JSON.parse(data);
        const prefill = getPrefillFromUrl(params);
        this.load(params, prefill);
    }

    load(params, prefill = {}) {
        this._params = JSON.parse(JSON.stringify(params));
        this._fields = loadForm(this, this._formId, params);

        if (this._fields.length === 0) {
            const submitBtn = this.querySelector(".pti-submit");
            if (submitBtn) setTimeout(() => submitBtn.click(), 0);
            return;
        }

        if (Object.keys(prefill).length > 0) {
            for (const f of this._fields) {
                if (f.param.name in prefill) {
                    applyPrefill(f, prefill[f.param.name]);
                }
            }
            const submitBtn = this.querySelector(".pti-submit");
            if (submitBtn) revalidateForm(this._fields, submitBtn);
        }
    }

    getValues() {
        return getFormValues(this._fields);
    }

    reset() {
        if (this._params) {
            const freshParams = JSON.parse(JSON.stringify(this._params));
            this._fields = loadForm(this, this._formId, freshParams);
        }
    }
}

customElements.define("pti-form", PtiForm);