function filterInt(input) {
    const raw = input.value.replace(/[^0-9-]/g, "");
    const negative = raw.charAt(0) === "-";
    const digits = raw.replace(/-/g, "");
    input.value = (negative ? "-" : "") + digits;
}

function getIntValue(input) {
    const v = input.value.trim();
    if (v === "" || v === "-") return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
}

function stepInt(input, step, direction) {
    const current = getIntValue(input) || 0;
    let next = current + (step * direction);
    const min = input.dataset.min;
    const max = input.dataset.max;
    if (max != null && next > Number(max)) next = Number(max);
    if (min != null && next < Number(min)) next = Number(min);
    if (next === current) return;
    input.value = next;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function validateInt(value, constraints) {
    if (value === null) throw new Error("Required");

    const c = constraints || {};
    if (c.ge != null && value < c.ge) throw new Error(`Must be ≥ ${c.ge}`);
    if (c.gt != null && value <= c.gt) throw new Error(`Must be > ${c.gt}`);
    if (c.le != null && value > c.le) throw new Error(`Must be ≤ ${c.le}`);
    if (c.lt != null && value >= c.lt) throw new Error(`Must be < ${c.lt}`);
}

function renderIntSlider(field, fieldId) {
    const step = (field.item_ui && field.item_ui.step != null) ? field.item_ui.step : 1;
    const showValue = field.item_ui ? field.item_ui.show_slider_value !== false : true;
    const c = field.constraints || {};

    let min = 0;
    let max = 100;
    
    if (c.ge != null) min = c.ge;
    else if (c.gt != null) min = c.gt + 1;
    
    if (c.le != null) max = c.le;
    else if (c.lt != null) max = c.lt - 1;

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
        const v = parseInt(slider.value, 10);
        return isNaN(v) ? null : v;
    };
    slider.validate = () => validateInt(slider.getValue(), field.constraints);

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

function renderIntNumber(field, fieldId) {
    const step = field.item_ui ? field.item_ui.step : 1;
    const c = field.constraints || {};

    const wrapper = document.createElement("div");
    wrapper.className = "pti-number-wrapper";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "text";
    input.id = fieldId;
    input.dataset.type = "int";
    if (field.default != null) input.value = field.default;
    if (c.ge != null) input.dataset.min = c.ge;
    if (c.gt != null) input.dataset.min = c.gt + 1;
    if (c.le != null) input.dataset.max = c.le;
    if (c.lt != null) input.dataset.max = c.lt - 1;

    input.addEventListener("input", () => filterInt(input));
    input.getValue = () => getIntValue(input);
    input.validate = () => validateInt(getIntValue(input), field.constraints);

    const controls = document.createElement("div");
    controls.className = "pti-number-controls";

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "pti-number-btn";
    upBtn.textContent = "▲";
    upBtn.addEventListener("click", () => stepInt(input, step, 1));

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "pti-number-btn";
    downBtn.textContent = "▼";
    downBtn.addEventListener("click", () => stepInt(input, step, -1));

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(controls);

    wrapper.input = input;
    return wrapper;
}

function renderInt(field, fieldId) {
    const isSlider = field.item_ui && field.item_ui.is_slider === true;
    
    if (isSlider) {
        return renderIntSlider(field, fieldId);
    } else {
        return renderIntNumber(field, fieldId);
    }
}