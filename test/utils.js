var reactive = require('reactive')
  , touch = require('../')

exports.createView = function(tpl, delegate, model, opts) {
  var view = reactive(tpl || '', model || {}, {
    delegate: delegate || {},
    bindings: touch(null, opts)
  })

  return view
}

exports.emit = function(view, event, data) {
  view.el.hammer.emit(event, data || {})
}