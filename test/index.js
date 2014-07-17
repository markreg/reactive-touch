var reactive = require('reactive')
  , touch = require('../')
  , test = require('tape')
  , Hammer = require('hammerjs')

// Use hammer's Simulator
require('hammerjs/tests/shared/simulator.js')

// This does not work on Chrome. Must 
// enable "Emulate touch screen".
Simulator.setType('touch');
Simulator.events.touch.fakeSupport();

test('on swipe', function (t) {
  t.plan(1)

  var template = '<div on-swipe="swipe" on-swipeleft="left">Swipe</div>'
  var view  = reactive(template, {}, {
    delegate: {
      swipe: function(ev, ctx) {
        t.ok(true, 'handler called')
      },
      // TODO: this only fires when swiped manually
      // left: function(ev, ctx) {
      //   console.log('swipeleft', ev, ctx)
      //   t.equal(ev.direction, Hammer.DIRECTION_LEFT) // true
      // }
    }
  })

  view.use(touch)

  document.body.appendChild(view.el)
  view.el.style.height = '100vh'

  setTimeout(function(){
    Simulator.gestures.swipe(view.el, { 
      duration: 200, deltaX: 0, deltaY: -600,
      pos: [100, 900], easing: 'linear'
    })
  }, 100)
})