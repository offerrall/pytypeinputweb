function el(tag, className, attrs) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (attrs) Object.assign(e, attrs);
    return e;
}

function makeLabel(param, fieldId) {
    const raw = (param.param_ui && param.param_ui.label) || param.name.replace(/_/g, " ");
    const text = raw.charAt(0).toUpperCase() + raw.slice(1);
    const label = el("label", null, { textContent: text });
    if (fieldId) label.setAttribute("for", fieldId);
    return label;
}

function makeAsterisk() {
    const asterisk = el("span", "pti-required", { textContent: " *" });
    asterisk.hidden = true;
    return asterisk;
}

function makeDescription(param) {
    if (param.param_ui && param.param_ui.description) {
        return el("small", null, { textContent: param.param_ui.description });
    }
    return null;
}

function makeError() {
    const err = el("div", "pti-error");
    err.hidden = true;
    return err;
}

function makeToggle(checked) {
    const wrapper = el("label", "pti-toggle-switch");
    const input = el("input", null, { type: "checkbox", checked });
    const slider = el("span", "pti-toggle-slider");
    wrapper.appendChild(input);
    wrapper.appendChild(slider);
    return { wrapper, input };
}

// ── List wrapper ──

function wrapWithList(param, fieldId, renderer) {
    const listMeta = param.list;
    const minItems = listMeta.min_length != null ? listMeta.min_length : 1;
    const maxItems = listMeta.max_length != null ? listMeta.max_length : null;
    const defaults = Array.isArray(param.default) ? param.default : [];

    const wrapper = el("div", "pti-list-wrapper");
    const container = el("div", "pti-list-container");
    const addBtn = el("button", "pti-list-add-btn", { type: "button", textContent: "+" });

    const items = [];
    let counter = 0;

    function makeItemParam(value) {
        const p = Object.assign({}, param);
        p.list = null;
        p.default = value != null ? value : null;
        return p;
    }

    function updateButtons() {
        const count = items.length;
        const canRemove = count > minItems;
        addBtn.hidden = maxItems !== null && count >= maxItems;
        for (const item of items) {
            item.removeBtn.style.display = canRemove ? "" : "none";
            item.row.classList.toggle("pti-list-item-no-remove", !canRemove);
        }
    }

    function clearItemError(item) {
        item.errorEl.hidden = true;
        item.errorEl.textContent = "";
        item.input.classList.remove("pti-input-error");
    }

    function addItem(value) {
        if (maxItems !== null && items.length >= maxItems) return;

        const itemId = `${fieldId}--item-${counter++}`;
        const rendered = renderer(makeItemParam(value), itemId);
        const input = rendered.input || rendered;

        const row = el("div", "pti-list-item");
        const itemRow = el("div", "pti-list-item-row");
        const content = el("div", "pti-list-item-content");
        const removeBtn = el("button", "pti-list-remove", { type: "button", textContent: "×" });

        // Per-item error element
        const errorEl = makeError();

        content.appendChild(rendered);
        itemRow.appendChild(content);
        itemRow.appendChild(removeBtn);
        row.appendChild(itemRow);
        row.appendChild(errorEl);
        container.appendChild(row);

        const item = { row, input, removeBtn, errorEl };
        items.push(item);

        input.addEventListener("input", () => {
            wrapper.dispatchEvent(new Event("input", { bubbles: true }));
        });

        removeBtn.addEventListener("click", () => {
            if (items.length <= minItems) return;
            const idx = items.indexOf(item);
            if (idx !== -1) items.splice(idx, 1);
            row.remove();
            updateButtons();
            wrapper.dispatchEvent(new Event("input", { bubbles: true }));
        });

        updateButtons();
        wrapper.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const initialCount = Math.max(minItems, defaults.length);
    for (let i = 0; i < initialCount; i++) {
        addItem(i < defaults.length ? defaults[i] : undefined);
    }

    addBtn.addEventListener("click", () => addItem());

    wrapper.appendChild(container);
    wrapper.appendChild(addBtn);

    wrapper.input = {
        getValue() {
            return items.map(item => item.input.getValue());
        },
        setValue(values) {
            if (!Array.isArray(values)) return;
            while (items.length > Math.max(minItems, values.length) && items.length > minItems) {
                const last = items.pop();
                last.row.remove();
            }
            while (items.length < values.length) {
                if (maxItems !== null && items.length >= maxItems) break;
                addItem(values[items.length]);
            }
            for (let i = 0; i < items.length && i < values.length; i++) {
                const inp = items[i].input;
                if (typeof inp.setValue === "function") {
                    inp.setValue(values[i]);
                } else if ("value" in inp) {
                    inp.value = values[i];
                    inp.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }
            updateButtons();
            wrapper.dispatchEvent(new Event("input", { bubbles: true }));
        },
        validate() {
            let firstError = null;
            for (const item of items) {
                try {
                    item.input.validate();
                    clearItemError(item);
                } catch (e) {
                    if (!firstError) firstError = e;
                    if (e.message === "Required") {
                        clearItemError(item);
                    } else {
                        item.errorEl.textContent = e.message;
                        item.errorEl.hidden = false;
                        item.input.classList.add("pti-input-error");
                    }
                }
            }
            if (firstError) throw firstError;
        },
        classList: wrapper.classList,
        addEventListener: (type, fn) => wrapper.addEventListener(type, fn),
        set disabled(v) {
            for (const item of items) {
                if (item.input.disabled !== undefined) item.input.disabled = v;
                item.removeBtn.disabled = v;
            }
            addBtn.disabled = v;
        }
    };

    return wrapper;
}

// ── Field creation ──

function createOptionalField(param, rendered, input) {
    const wrapper = el("div", "pti-field");
    wrapper.dataset.field = param.name;

    const header = el("div", "pti-optional-header");
    const labelWrapper = el("div", "pti-optional-label-wrapper");

    const label = makeLabel(param);
    label.className = "pti-label";
    const asterisk = makeAsterisk();
    label.appendChild(asterisk);
    labelWrapper.appendChild(label);

    const desc = makeDescription(param);
    if (desc) labelWrapper.appendChild(desc);

    header.appendChild(labelWrapper);

    const enabled = param.optional && param.optional.enabled;
    const toggle = makeToggle(enabled);
    header.appendChild(toggle.wrapper);
    wrapper.appendChild(header);

    const content = el("div", enabled ? "pti-optional-content" : "pti-optional-content pti-optional-content-hidden");
    const errorEl = makeError();

    content.appendChild(rendered);
    content.appendChild(errorEl);
    wrapper.appendChild(content);

    if (!enabled && input.disabled !== undefined) {
        input.disabled = true;
    }

    toggle.input.addEventListener("change", () => {
        if (toggle.input.checked) {
            content.classList.remove("pti-optional-content-hidden");
            if (input.disabled !== undefined) input.disabled = false;
            window.getSelection().removeAllRanges();
        } else {
            content.classList.add("pti-optional-content-hidden");
            if (input.disabled !== undefined) input.disabled = true;
            asterisk.hidden = true;
            errorEl.hidden = true;
            input.classList.remove("pti-input-error");
        }
    });

    return { param, wrapper, input, errorEl, asterisk, toggle: toggle.input };
}

function createStandardField(param, fieldId, rendered, input) {
    const wrapper = el("div", "pti-field");
    wrapper.dataset.field = param.name;

    const label = makeLabel(param, fieldId);
    const asterisk = makeAsterisk();
    label.appendChild(asterisk);
    wrapper.appendChild(label);

    const desc = makeDescription(param);
    if (desc) wrapper.appendChild(desc);

    wrapper.appendChild(rendered);

    const errorEl = makeError();
    wrapper.appendChild(errorEl);

    return { param, wrapper, input, errorEl, asterisk };
}

function createField(param, fieldId, renderer) {
    const isFile = renderer === renderFile;
    const isList = !isFile && param.list != null;
    const isOptional = param.optional != null;

    const rendered = isList
        ? wrapWithList(param, fieldId, renderer)
        : renderer(param, fieldId);

    const input = rendered.input || rendered;

    if (isOptional) {
        return createOptionalField(param, rendered, input);
    } else {
        return createStandardField(param, fieldId, rendered, input);
    }
}