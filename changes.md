# reactive-touch changelog

## 1.0.0

New features

- Per-view and per-element options
- Reactive enabling of events
- Default handler name is event name
- `with` and `requireFailure` options
- Custom recognizers

Breaking changes

- `touch()` wraps bindings. Before 1.0.0, the plugin was loaded with `view.use(touch)`. This created problems with reactive's `each` binding and scope, because a reactive instance renders immediately ([reactive#126](https://github.com/component/reactive/issues/126))
- `touch-setup` replaced by `[recognizer]-setup`