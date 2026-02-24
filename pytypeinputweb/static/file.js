// ── Helpers ──

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + units[i];
}

function patternToAccept(pattern) {
    if (!pattern) return null;
    const m = pattern.match(/\\\.\(([^)]+)\)/);
    if (!m) return null;
    return m[1].split("|").map(ext => "." + ext).join(",");
}

function filterByAccept(files, accept) {
    if (!accept) return files;
    const types = accept.split(",").map(t => t.trim().toLowerCase());
    return files.filter(f =>
        types.some(t => f.name.toLowerCase().endsWith(t))
    );
}

function rebuildFileInput(input, files) {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    input.files = dt.files;
}

// ── Drag & drop ──

function setupDrag(element, onDrop) {
    let counter = 0;

    element.addEventListener("dragenter", e => {
        e.preventDefault(); e.stopPropagation();
        if (++counter === 1) element.classList.add("pti-dragging");
    });
    element.addEventListener("dragover", e => {
        e.preventDefault(); e.stopPropagation();
    });
    element.addEventListener("dragleave", e => {
        e.preventDefault(); e.stopPropagation();
        if (--counter === 0) element.classList.remove("pti-dragging");
    });
    element.addEventListener("drop", e => {
        e.preventDefault(); e.stopPropagation();
        counter = 0;
        element.classList.remove("pti-dragging");
        onDrop(Array.from(e.dataTransfer.files));
    });
}

// ── File list UI ──

function createFileItem(file, onRemove) {
    const item = el("div", "pti-file-item");

    const info = el("div", "pti-file-info");
    const name = el("span", "pti-file-name", { textContent: file.name, title: file.name });
    const size = el("span", "pti-file-size", { textContent: formatBytes(file.size) });
    info.appendChild(name);
    info.appendChild(size);

    const removeBtn = el("button", "pti-file-remove", { type: "button", textContent: "×", title: "Remove file" });
    removeBtn.addEventListener("click", onRemove);

    item.appendChild(info);
    item.appendChild(removeBtn);
    return item;
}

// ── Renderer ──

function renderFile(param, fieldId) {
    const isList = param.list != null;
    const pattern = param.constraints ? param.constraints.pattern : null;
    const accept = patternToAccept(pattern);
    const maxFiles = isList && param.list.max_length != null ? param.list.max_length : null;
    const minFiles = isList && param.list.min_length != null ? param.list.min_length : 1;
    let storedFiles = [];

    // DOM
    const wrapper = el("div", "pti-file-wrapper");
    const inputRow = el("div", "pti-file-input-row");

    const input = el("input", "pti-file-input", { type: "file", id: fieldId });
    if (accept) input.accept = accept;
    if (isList) input.multiple = true;

    inputRow.appendChild(input);

    let addBtn = null;
    if (isList) {
        addBtn = el("button", "pti-file-add-btn", { type: "button", textContent: "+" });
        inputRow.appendChild(addBtn);
    }

    const listDiv = el("div", "pti-file-list");

    wrapper.appendChild(inputRow);
    wrapper.appendChild(listDiv);

    // State management
    function setFiles(files) {
        if (!isList && files.length > 1) files = [files[0]];
        if (maxFiles !== null && files.length > maxFiles) files = files.slice(0, maxFiles);
        storedFiles = files;
        rebuildFileInput(input, storedFiles);
        renderList();
        updateAddBtn();
        wrapper.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function addFiles(newFiles) {
        const filtered = filterByAccept(newFiles, accept);
        if (!filtered.length) return;
        if (isList) {
            setFiles([...storedFiles, ...filtered]);
        } else {
            setFiles([filtered[0]]);
        }
    }

    function removeFile(index) {
        storedFiles.splice(index, 1);
        rebuildFileInput(input, storedFiles);
        renderList();
        updateAddBtn();
        wrapper.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function updateAddBtn() {
        if (!addBtn) return;
        const atMax = maxFiles !== null && storedFiles.length >= maxFiles;
        addBtn.hidden = atMax;
    }

    function renderList() {
        listDiv.innerHTML = "";
        storedFiles.forEach((file, i) => {
            listDiv.appendChild(createFileItem(file, () => removeFile(i)));
        });
    }

    // Events: native input change
    input.addEventListener("change", () => {
        setFiles(filterByAccept(Array.from(input.files), accept));
    });

    // Events: add more button
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const tmp = el("input", null, { type: "file", multiple: true });
            if (accept) tmp.accept = accept;
            tmp.addEventListener("change", () => addFiles(Array.from(tmp.files)));
            tmp.click();
        });

        setupDrag(addBtn, dropped => addFiles(dropped));
    }

    // Events: drag & drop on input
    setupDrag(input, dropped => setFiles(filterByAccept(dropped, accept)));

    // Interface
    wrapper.input = {
        getValue: () => isList ? [...storedFiles] : (storedFiles[0] || null),
        validate: () => {
            if (storedFiles.length === 0) throw new Error("Required");
            if (isList && storedFiles.length < minFiles) throw new Error(`Min ${minFiles} files`);
        },
        classList: wrapper.classList,
        addEventListener: (t, fn) => wrapper.addEventListener(t, fn),
        set disabled(v) {
            input.disabled = v;
            if (addBtn) addBtn.disabled = v;
        }
    };

    return wrapper;
}