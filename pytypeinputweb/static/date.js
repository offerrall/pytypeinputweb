function renderDate(field, fieldId) {
    const input = document.createElement("input");
    input.type = "date";
    input.id = fieldId;
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