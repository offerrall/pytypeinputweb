function renderBool(field, fieldId) {
    const wrapper = document.createElement("div");
    wrapper.className = "pti-bool-wrapper";

    const label = document.createElement("label");
    label.className = "pti-toggle-switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = fieldId;
    input.checked = field.default === true;

    const slider = document.createElement("span");
    slider.className = "pti-toggle-slider";

    label.appendChild(input);
    label.appendChild(slider);
    wrapper.appendChild(label);

    wrapper.input = {
        getValue() { return input.checked; },
        validate() {},
        classList: wrapper.classList,
        addEventListener: (type, fn) => input.addEventListener(type, fn),
        set disabled(v) { input.disabled = v; }
    };

    input.addEventListener("change", () => {
        wrapper.dispatchEvent(new Event("input", { bubbles: true }));
    });

    return wrapper;
}