function renderTime(field, fieldId) {
    const input = document.createElement("input");
    input.type = "time";
    input.id = fieldId;
    input.className = "pti-time";
    if (field.default != null) input.value = field.default;

    input.getValue = () => {
        const v = input.value;
        return v === "" ? null : v;
    };
    input.validate = () => {
        if (input.getValue() === null) throw new Error("Required");
    };

    return input;
}