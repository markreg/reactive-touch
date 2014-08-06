var reactive = require('reactive')
  , touch = require('../')

var opts = {
  tap: { requireFailure: 'mycustomtap' },
  mycustomtap: { taps: 2, with: 'tap'  }
}

var view  = reactive(template, {}, {
  bindings: touch(null, opts),
  delegate: {
    toggle: function(ev, ctx) {
      ctx.set('active', !ctx.model.active)
    },
    swipeleft: function(ev, ctx) {
      ctx.set('distance', ev.distance)
    },
    tap: function(ev, ctx) {
      ctx.set('tapped', ev.type)
    }
  }
})

document.getElementById('example')
 .appendChild(view.el)
