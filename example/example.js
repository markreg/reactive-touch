var reactive = require('reactive')
  , touch = require('../')

// Monkey patch a Hammer bug. See: 
// https://github.com/hammerjs/hammer.js/pull/637
patchHammer()

// Define mycustomtap recognizer
var opts = {
  tap: { requireFailure: 'mycustomtap' },
  mycustomtap: {
    taps: 2,
    with: 'singletap'
  }
}

var model = { active: false, distance: 0 }
var template = document.getElementById('template').innerHTML

var view  = reactive(template, model, {
  bindings: touch(null, opts),
  delegate: {
    toggle: function(ev, ctx) {
      ctx.set('active', !ctx.model.active)
    },
    swipeleft: function(ev, ctx) {
      ctx.set('distance', ev.distance)
    },
    tapBtn: function(ev, ctx) {
      ctx.set('tapped', ev.type)
    },
    doubletapBtn: function(ev, ctx) {
      ctx.set('tapped', ev.type)
    }
  }
})

document.body.appendChild(view.el)

function patchHammer() {
  var proto = require('hammerjs').Swipe.prototype
    , old = proto.attrTest
  proto.attrTest = function(input) {
    return old.call(this, input) && input.distance > this.options.threshold
  }
}