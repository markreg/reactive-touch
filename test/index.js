var reactive = require('reactive')
  , touch = require('../')
  , test = require('tape')
  , Hammer = require('hammerjs')

// Use hammer's Simulator
require('hammerjs/tests/shared/simulator.js')

Simulator.setType('touch')
Simulator.events.touch.fakeSupport()

test('on swipe', function (t) {
  t.plan(3)

  var template = 
    '<div on-swipe="swipe" on-swipeleft="left">' +
    'Swipe</div>'

  var view  = reactive(template, {a: 10}, {
    delegate: {
      swipe: function(ev, ctx) {
        t.ok(true, 'handler called')
        t.equal(ctx.model.a, 10, 'has context')
      },
      left: function(ev, ctx) {
        t.equal(ev.direction, Hammer.DIRECTION_LEFT)
      }
    }
  })

  view.use(touch)

  var el = view.el
  document.body.appendChild(el)
  el.style.height = '200px'

  setTimeout(function(){

    Simulator.gestures.swipe(el, { 
      duration: 150, deltaX: -140, deltaY: 5,
      pos: [150, 10],
      easing: 'cubic'
    }, function done() {
      // ..
    })

  }, 900)
})