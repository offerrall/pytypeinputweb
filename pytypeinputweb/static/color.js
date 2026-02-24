function renderColor(field, fieldId) {
    const wrapper = document.createElement("div");
    wrapper.className = "pti-color-wrapper";

    const input = document.createElement("input");
    input.type = "color";
    input.id = fieldId;
    input.className = "pti-color";
    input.value = field.default || "#000000";

    const hexDisplay = document.createElement("span");
    hexDisplay.className = "pti-color-hex";
    hexDisplay.textContent = input.value;

    input.addEventListener("input", () => {
        hexDisplay.textContent = input.value;
        wrapper.dispatchEvent(new Event("input", { bubbles: true }));
    });

    wrapper.appendChild(input);
    wrapper.appendChild(hexDisplay);

    wrapper.input = {
        getValue() { return input.value; },
        validate() {},
        classList: wrapper.classList,
        addEventListener: (type, fn) => input.addEventListener(type, fn),
        set disabled(v) { input.disabled = v; }
    };

    return wrapper;
}