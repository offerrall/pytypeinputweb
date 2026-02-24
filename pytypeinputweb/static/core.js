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
    submitBtn.textContent = "Submit";
    submitBtn.type = "button";
    submitBtn.disabled = true;
    submitBtn.addEventListener("click", () => {
        const values = getFormValues(fields);
        container.dispatchEvent(new CustomEvent("submit", { detail: values }));
    });

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

    btnContainer.appendChild(submitBtn);
    btnContainer.appendChild(resetBtn);
    container.appendChild(btnContainer);

    for (const f of fields) {
        if (f.toggle) {
            f.toggle.addEventListener("change", () => {
                revalidateForm(fields, submitBtn);
                container.dispatchEvent(new CustomEvent("change", { detail: getFormValues(fields) }));
            });
        }
    }

    revalidateForm(fields, submitBtn);
    return fields;
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
        if (data) this.load(JSON.parse(data));
    }

    load(params) {
        this._params = JSON.parse(JSON.stringify(params));
        this._fields = loadForm(this, this._formId, params);
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