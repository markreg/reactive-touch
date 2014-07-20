var touch = require('../')
  , test = require('tape')
  , Hammer = require('hammerjs')
  , createView = require('./utils').createView

test('reactive-touch', function(t){
  t.equal(typeof touch, 'function', 'is a function')
  t.throws(touch, Error, 'requires a reactive instance')
  t.end()
})

test('bind', function(t){
  var view = createView('<div on-swipe="foo"></div>')
  var meta = view.el.touchBinding || {}
  
  t.ok(meta.mc instanceof Hammer.Manager, 'has a manager')
  t.ok(meta.Swipe instanceof Hammer.Recognizer, 'has a recognizer')
  t.ok(meta.Tap == null, 'no unnecessary recognizer')
  t.end()
})

test('handlers', function(t){
  t.plan(4)

  var view = createView('<div on-tap="foo" on-swipe="bar"></div>', {
    foo: function(ev, ctx) {
      t.equal(ev.a, 10, 'invoked')
      t.equal(this, ctx.view, 'fn context is view')
    }
  })

  var mc = view.el.touchBinding.mc
  mc.emit('tap', {a: 10})

  function swipe()  { 
    mc.emit('swipe', {})
  }
  
  function create() { 
    createView('<div on-tap=""></div>')
  }

  t.throws(swipe,  Error, 'asserts handler exists')
  t.throws(create, Error, 'asserts method name is given')
})

test('setup', function(t){
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

  var mc = view.el.touchBinding.mc
  view.destroy()

  t.ok(view.el.touchBinding == null, 'removes metadata')

  mc.emit('tap', {})
  t.ok(dontset == null, 'removes listeners')
  t.end()
})