function validateStr(value, constraints, field) {
    if (value === null) throw new Error("Required");

    const c = constraints || {};
    if (c.min_length != null && value.length < c.min_length)
        throw new Error(`Must be at least ${c.min_length} characters`);
    if (c.max_length != null && value.length > c.max_length)
        throw new Error(`Must be at most ${c.max_length} characters`);
    if (c.pattern != null && !new RegExp(c.pattern).test(value)) {
        const msg = (field && field.item_ui && field.item_ui.pattern_message)
            || `Must match pattern ${c.pattern}`;
        throw new Error(msg);
    }
}

function makeEyeIcon(open) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    if (open) {
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "3");
        svg.appendChild(path1);
        svg.appendChild(circle);
    } else {
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", "M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19");
        const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path3.setAttribute("d", "M14.12 14.12a3 3 0 1 1-4.24-4.24");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "1");
        line.setAttribute("y1", "1");
        line.setAttribute("x2", "23");
        line.setAttribute("y2", "23");
        svg.appendChild(path1);
        svg.appendChild(path2);
        svg.appendChild(path3);
        svg.appendChild(line);
    }

    return svg;
}

function renderStrTextarea(field, fieldId) {
    const rows = (field.item_ui && field.item_ui.rows) || 4;
    const c = field.constraints || {};

    const textarea = document.createElement("textarea");
    textarea.id = fieldId;
    textarea.className = "pti-textarea";
    textarea.rows = rows;
    if (field.default != null) textarea.value = field.default;
    if (field.item_ui && field.item_ui.placeholder) textarea.placeholder = field.item_ui.placeholder;
    if (c.max_length != null) textarea.maxLength = c.max_length;

    textarea.getValue = () => {
        const v = textarea.value;
        return v === "" ? null : v;
    };
    textarea.validate = () => validateStr(textarea.getValue(), field.constraints, field);

    return textarea;
}

function renderStrPassword(field, fieldId) {
    const c = field.constraints || {};

    const wrapper = document.createElement("div");
    wrapper.className = "pti-password-wrapper";

    const input = document.createElement("input");
    input.type = "password";
    input.id = fieldId;
    input.className = "pti-password";
    if (field.default != null) input.value = field.default;
    if (field.item_ui && field.item_ui.placeholder) input.placeholder = field.item_ui.placeholder;
    if (c.max_length != null) input.maxLength = c.max_length;

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "pti-password-toggle";
    toggleBtn.appendChild(makeEyeIcon(false));

    toggleBtn.addEventListener("click", () => {
        const showing = input.type === "password";
        input.type = showing ? "text" : "password";
        toggleBtn.innerHTML = "";
        toggleBtn.appendChild(makeEyeIcon(showing));
    });

    input.getValue = () => {
        const v = input.value;
        return v === "" ? null : v;
    };
    input.validate = () => validateStr(input.getValue(), field.constraints, field);

    wrapper.appendChild(input);
    wrapper.appendChild(toggleBtn);
    wrapper.input = input;
    return wrapper;
}

function renderStrInput(field, fieldId) {
    const c = field.constraints || {};

    const input = document.createElement("input");
    input.type = "text";
    input.id = fieldId;
    if (field.default != null) input.value = field.default;
    if (field.item_ui && field.item_ui.placeholder) input.placeholder = field.item_ui.placeholder;
    if (c.max_length != null) input.maxLength = c.max_length;

    input.getValue = () => {
        const v = input.value;
        return v === "" ? null : v;
    };
    input.validate = () => validateStr(input.getValue(), field.constraints, field);

    return input;
}

function renderStr(field, fieldId) {
    const isPassword = field.item_ui && field.item_ui.is_password === true;
    const isTextarea = field.item_ui && field.item_ui.rows != null;

    if (isPassword) {
        return renderStrPassword(field, fieldId);
    } else if (isTextarea) {
        return renderStrTextarea(field, fieldId);
    } else {
        return renderStrInput(field, fieldId);
    }
}