var touch = require('../')
  , reactive = require('reactive')
  , test = require('tape')
  , Hammer = require('hammerjs')
  , utils = require('./utils')
  , emit = utils.emit
  , createView = utils.createView

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
  t.ok(manager.swipe instanceof Hammer.Recognizer, 'has a recognizer')
  t.ok(manager.tap == null, 'no unnecessary recognizer')
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

  emit(view, 'tap',  {a: 10})
  emit(view, 'press', {a: 10})

  function swipe()  { 
    emit(view, 'swipe')
  }

  t.throws(swipe,  Error, 'asserts handler exists')
})

test('option attributes', function(t){
  var tpl = '<div on-swipe on-tap '+
    'swipe-threshold="50" swipe-velocity="0.96" '+
    'swipe-direction="left" swipe-with="tap"'+
    ' tap-requireFailure="swipe"></div>'
  
  var view = createView(tpl)
    , swipe = view.el.hammer.swipe
    , tap = view.el.hammer.tap
    , options = swipe.options
  
  t.equal(options.threshold, 50, 'integer')
  t.equal(options.velocity, 0.96, 'float')
  t.equal(options.direction, Hammer.DIRECTION_LEFT, 'direction')
  t.equal(swipe.simultaneous[tap.id], tap, 'recognizeWith')
  t.deepEqual(tap.requireFail, [swipe], 'require fail')

  t.end()
})

test('view options', function(t){
  var tpl = '<div on-swipe on-tap swipe-threshold="50"></div>'

  var opts = {
    swipe: {
      threshold: 40,
      velocity: 0.38,
      direction: 'all',
      with: 'tap'
    },
    tap: {
      requireFailure: 'swipe'
    }
  }

  var view = createView(tpl, null, null, opts)
    , swipe = view.el.hammer.swipe
    , tap = view.el.hammer.tap
    , options = swipe.options
  
  t.equal(options.threshold, 50, 'integer (overridden)')
  t.equal(options.velocity, opts.swipe.velocity, 'float')
  t.equal(options.direction, Hammer.DIRECTION_ALL, 'direction')
  t.equal(swipe.simultaneous[tap.id], tap, 'recognizeWith')
  t.deepEqual(tap.requireFail, [swipe], 'require fail')

  t.end()
})

test('custom event', function(t){
  t.plan(3)

  var tpl = '<div on-doubletap doubletap-pointers="3"></div>'

  var view = createView(tpl, {
    doubletap: function(ev, ctx) {
      t.equal(ev.type, 'doubletap', 'sets event type')
    }
  }, null, {
    doubletap: {
      taps: 2
    }
  })

  var dbl = view.el.hammer.doubletap
  t.ok(dbl instanceof Hammer.Tap, 'is a Tap recognizer')
  t.equal(dbl.options.pointers, 3, 'sets options')

  emit(view, 'doubletap')
})

test('reactive enable', function(t){
  var tpl = '<div on-tap tap-enable="{active}"></div>'
  var testvar = null
  var view = createView(tpl, {
    tap: function(ev, ctx) {
      testvar = 10
    }
  }, { active: false })

  var tap = view.el.hammer.tap
  t.equal(tap.options.enable, false, 'disabled')

  // bit tricky to rely on Hammer internals 
  // for testing, better remove this later 
  // (and only test options.enable)
  var input = {
    pointers: [{}],
    distance: 0,
    deltaTime: 0,
    eventType: 4 // INPUT_END
  }

  tap.recognize(input)
  t.equal(testvar, null, 'no emit')

  view.set('active', true)
  t.equal(tap.options.enable, true, 'enabled')
  tap.recognize(input)
  t.equal(testvar, 10, 'emitted')
  
  t.end()
})

test('setup', function(t){
  var tpl = '<div on-swipe on-swipeleft swipe-setup="setup"></div>'

  t.plan(4)
  createView(tpl, {
    swipeleft: function() {},
    left: function() {},
    // setup should be called once
    setup: function(el, recognizer, ctx) {
      t.ok(recognizer instanceof Hammer.Swipe)
      t.equal(this, ctx.view, 'fn context is view')
    }
  })

  createView('<div on-swipe></div>', {
    swipe: function() {},
    setup: function(el, recognizer, ctx) {
      t.ok(true, 'view method invoked')
    }
  }, null, {
    swipe: {
      setup: 'setup'
    }
  })

  createView('<div on-swipe></div>', {
    swipe: function() {}
  }, null, {
    swipe: {
      setup: function(el, recognizer, ctx) {
        t.ok(true, 'regular fn invoked')
      }
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