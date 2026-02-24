function filterFloat(input) {
    let raw = input.value.replace(/[^0-9.\-]/g, "");
    const negative = raw.charAt(0) === "-";
    raw = raw.replace(/-/g, "");
    const parts = raw.split(".");
    const cleaned = parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
    input.value = (negative ? "-" : "") + cleaned;
}

function getFloatValue(input) {
    const v = input.value.trim();
    if (v === "" || v === "-" || v === ".") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
}

function stepFloat(input, step, direction) {
    const current = getFloatValue(input) || 0;
    let next = parseFloat((current + step * direction).toPrecision(12));
    const min = input.dataset.min;
    const max = input.dataset.max;
    if (max != null && next > Number(max)) next = Number(max);
    if (min != null && next < Number(min)) next = Number(min);
    if (next === current) return;
    input.value = next;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function validateFloat(value, constraints) {
    if (value === null) throw new Error("Required");

    const c = constraints || {};
    if (c.ge != null && value < c.ge) throw new Error(`Must be ≥ ${c.ge}`);
    if (c.gt != null && value <= c.gt) throw new Error(`Must be > ${c.gt}`);
    if (c.le != null && value > c.le) throw new Error(`Must be ≤ ${c.le}`);
    if (c.lt != null && value >= c.lt) throw new Error(`Must be < ${c.lt}`);
}

function renderFloatSlider(field, fieldId) {
    const step = (field.item_ui && field.item_ui.step != null) ? field.item_ui.step : 0.1;
    const showValue = field.item_ui ? field.item_ui.show_slider_value !== false : true;
    const c = field.constraints || {};

    let min = 0;
    let max = 100;

    if (c.ge != null) min = c.ge;
    else if (c.gt != null) min = c.gt + step;

    if (c.le != null) max = c.le;
    else if (c.lt != null) max = c.lt - step;

    const wrapper = document.createElement("div");
    wrapper.className = "pti-slider-wrapper";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = fieldId;
    slider.className = "pti-slider";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = field.default != null ? field.default : min;

    slider.getValue = () => {
        const v = parseFloat(slider.value);
        return isNaN(v) ? null : v;
    };
    slider.validate = () => validateFloat(slider.getValue(), field.constraints);

    wrapper.appendChild(slider);

    if (showValue) {
        const valueDisplay = document.createElement("div");
        valueDisplay.className = "pti-slider-value";
        valueDisplay.textContent = slider.value;

        slider.addEventListener("input", () => {
            valueDisplay.textContent = slider.value;
        });

        wrapper.appendChild(valueDisplay);
    }

    wrapper.input = slider;
    return wrapper;
}

function renderFloatNumber(field, fieldId) {
    const step = (field.item_ui && field.item_ui.step != null) ? field.item_ui.step : 0.1;
    const c = field.constraints || {};

    const wrapper = document.createElement("div");
    wrapper.className = "pti-number-wrapper";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "text";
    input.id = fieldId;
    input.dataset.type = "float";
    if (field.default != null) input.value = field.default;
    if (c.ge != null) input.dataset.min = c.ge;
    if (c.gt != null) input.dataset.min = c.gt;
    if (c.le != null) input.dataset.max = c.le;
    if (c.lt != null) input.dataset.max = c.lt;

    input.addEventListener("input", () => filterFloat(input));
    input.getValue = () => getFloatValue(input);
    input.validate = () => validateFloat(getFloatValue(input), field.constraints);

    const controls = document.createElement("div");
    controls.className = "pti-number-controls";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "pti-number-btn";
    upBtn.textContent = "▲";
    upBtn.addEventListener("click", () => stepFloat(input, step, 1));

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "pti-number-btn";
    downBtn.textContent = "▼";
    downBtn.addEventListener("click", () => stepFloat(input, step, -1));

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(controls);

    wrapper.input = input;
    return wrapper;
}

function renderFloat(field, fieldId) {
    const isSlider = field.item_ui && field.item_ui.is_slider === true;

    if (isSlider) {
        return renderFloatSlider(field, fieldId);
    } else {
        return renderFloatNumber(field, fieldId);
    }
}