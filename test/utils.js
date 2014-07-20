var reactive = require('reactive')
  , touch = require('../')

exports.createView = function(tpl, delegate, model) {
  var view = reactive(tpl || '', model || {}, {
    delegate: delegate || {}
  })

  view.use(touch)
  return view
}