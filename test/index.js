var touch = require('../')
  , reactive = require('reactive')
  , test = require('tape')
  , Hammer = require('hammerjs')
  , createView = require('./utils').createView

test('reactive-touch', function(t){
  t.equal(typeof touch, 'function', 'is a function')
  t.throws(oldSetup, Error, 'deprecated view.use')
  t.end()

  function oldSetup() { reactive('<p></p>').use(touch) }
})

test('bind', function(t){
  var view = createView('<div on-swipe="foo"></div>')
  var manager = view.el.hammer || {}
  
  t.ok(manager instanceof Hammer.Manager, 'has a manager')
  t.ok(manager.Swipe instanceof Hammer.Recognizer, 'has a recognizer')
  t.ok(manager.Tap == null, 'no unnecessary recognizer')
  t.end()
})

test('handlers', function(t){
  t.plan(4)

  var view = createView('<div on-tap="foo" on-press on-swipe="bar"></div>', {
    foo: function(ev, ctx) {
      t.equal(ev.a, 10, 'custom name invoked')
      t.equal(this, ctx.view, 'fn context is view')
    },
    press: function(ev, ctx) {
      t.equal(ev.a, 10, 'default name invoked')
    }
  })

  var manager = view.el.hammer

  manager.emit('tap',  {a: 10})
  manager.emit('press', {a: 10})

  function swipe()  { 
    manager.emit('swipe', {})
  }

  t.throws(swipe,  Error, 'asserts handler exists')
})

test.skip('setup', function(t){
  var tpl = '<div id="a" on-swipe="swipe" on-swipeleft="left" touch-setup="setup"></div>'

  t.plan(3) // setup should be called once
  createView(tpl, {
    swipe: function() {},
    left: function() {},
    setup: function(el, recognizer, ctx) {
      t.equal(el.id, 'a')
      t.ok(recognizer instanceof Hammer.Swipe)
      t.equal(this, ctx.view, 'fn context is view')
    }
  })
})

test('destroy', function(t){
  var dontset
  var view = createView('<div on-tap="dontcall"></div>', {
    dontcall: function() {
      dontset = 100
    }
  })

  var manager = view.el.hammer
  view.destroy()

  t.ok(view.el.hammer == null, 'removes hammer')

  manager.emit('tap', {})
  t.ok(dontset == null, 'removes listeners')
  t.end()
})