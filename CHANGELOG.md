# Changelog

All notable changes to pytypeinputweb are documented in this file.

## [1.0.2]

### Fixed

- **URL prefill for `list`-typed fields.** When a form was loaded with a query
  string like `?tags=["a","b","c"]`, `applyPrefill` only knew how to populate
  single-value inputs: it called `wrapper.querySelector('input[type="text"], …')`
  and assigned `el.value = val` to the **first** input of the list, dropping
  the literal JSON string into item 0 and leaving the rest empty. Lists were
  effectively unusable for edit-row flows (e.g. clicking a row in
  func-to-web's `ActionTable` and landing on a prefilled edit form).

### Changed

- **`wrapWithList` (`static/field.js`) now exposes `setValue(array)` on
  `wrapper.input`.** It resizes the rendered items to match the array length
  (respecting `min_length` / `max_length`), then writes each value into its
  corresponding item input. Per-item it prefers a renderer-provided
  `setValue`, otherwise falls back to assigning `inp.value` and dispatching
  an `input` event. After the resize and writes it calls `updateButtons()`
  and emits a single `input` event on the wrapper so the form revalidates
  once.

- **`applyPrefill` (`static/core.js`) now handles list fields.** Before the
  existing per-type branches, it checks `f.param.list != null`, parses the
  raw URL value as JSON, and delegates to `f.input.setValue(arr)`. Malformed
  JSON or non-array payloads are ignored silently, leaving the field at its
  default rather than throwing. The optional toggle handling at the top of
  `applyPrefill` still runs first, so `Optional[list[...]]` prefill flips
  the toggle and then populates the items.

### Compatibility notes

- The fix expects list URL values to be **JSON-encoded** (e.g.
  `tags=%5B%22a%22%2C%22b%22%5D`). Python `repr()` style (`['a', 'b']` with
  single quotes) is not valid JSON and will be ignored. On the consumer
  side, func-to-web ≥ 1.0.2 already JSON-encodes `ActionTable` cells for
  list/tuple/dict values, so the round-trip works end-to-end.

- The fallback path inside `setValue` covers any item renderer whose `input`
  is a real DOM element with a `value` property — i.e. `str`, `int`, `float`,
  `date`, `time`, `color`, `password` and textarea. Renderers that wrap
  their input in a plain object (`bool`, `choice`) would need to define
  their own `setValue` to participate in list prefill; this was out of scope
  for the reported bug (`list[str]` / `list[int]`).

- Public API for the form (`getValues`, `validate`, the `pti-form` custom
  element) is unchanged. The new `setValue` lives on the internal
  `wrapper.input` and is invoked by `applyPrefill` — no consumer code needs
  to call it directly.
