function renderChoice(field, fieldId) {
    const choices = field.choices;
    if (!choices || !choices.options) return null;

    const options = choices.options;

    const select = document.createElement("select");
    select.id = fieldId;
    select.className = "pti-select";

    for (const opt of options) {
        const option = document.createElement("option");
        option.value = typeof opt === "object" ? opt.value ?? opt : opt;
        option.textContent = typeof opt === "object" ? opt.label ?? opt.value ?? String(opt) : String(opt);
        select.appendChild(option);
    }

    if (field.default != null) {
        select.value = String(field.default);
    }

    select.getValue = () => select.value;

    select.validate = () => {};

    return select;
}