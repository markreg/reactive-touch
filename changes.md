# reactive-touch changelog

## 1.0.0

New features

- Per-view and per-element options
- Reactive enabling of events
- Default handler name is event name
- `with` and `requireFailure` options
- Custom recognizers

Breaking changes

- `touch()` wraps bindings, instead of `view.use(touch)`
- `touch-setup` replaced by `[recognizer]-setup`

Internal

- `el.touchBinding` (metadata object) replaced by `el.hammer` (Hammer Manager)
- Merged code to a single `getManager` function