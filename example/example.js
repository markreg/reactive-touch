var reactive = require('reactive')
  , touch = require('../')

// Define mycustomtap recognizer
var opts = {
  tap: { requireFailure: 'mycustomtap' },
  mycustomtap: {
    taps: 2,
    with: 'singletap'
  }
}

var model = { active: false, distance: 0 }

var view  = reactive(template(), model, {
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

document.getElementById('container').appendChild(view.el)

function template() {
  var fs = require('fs')
  var template = fs.readFileSync(__dirname + '/template.html', 'utf-8')

  // Monkey patch a Hammer bug. See: 
  // https://github.com/hammerjs/hammer.js/pull/637
  patchHammer()

  return template
}

function patchHammer() {
  var proto = require('hammerjs').Swipe.prototype
    , old = proto.attrTest
  proto.attrTest = function(input) {
    return old.call(this, input) && input.distance > this.options.threshold
  }
}