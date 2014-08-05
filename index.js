var Hammer  = require('hammerjs')
  , utils   = require('reactive/lib/utils')
  , xtend   = require('xtend')

var recognizers = ['Pan', 'Pinch', 'Press', 'Rotate', 'Swipe', 'Tap']
  , defaults = {}

for (var i = recognizers.length - 1; i >= 0; i--) {
  defaults[recognizers[i].toLowerCase()] = {
    recognizer: recognizers[i],
    enable: true
  }
}

var eventSuffixes = 
  { 'Pan':    [ 'start', 'move', 'end', 'cancel'
              , 'left', 'right', 'up', 'down' ]
  , 'Pinch':  [ 'start', 'move', 'end', 'cancel', 'in', 'out' ]
  , 'Rotate': [ 'start', 'move', 'end', 'cancel' ]
  , 'Swipe':  [ 'left', 'right', 'up', 'down' ]
}

// Parse functions for option attributes; 
// default (most common) is "parseInt"
var optionParsers = 
  { velocity: parseFloat
  , enable: function(val) {
      return val=='false' ? false : !!val
    }
  , direction: function(val) {
      var constant = Hammer['DIRECTION_' + val.toUpperCase()]
      return constant != null ? constant : parseInt(val)
    }
  }

module.exports = function (bindings, opts) {
  // Ensure it's not a Reactive instance
  if (bindings && bindings.bindings) {
    throw new Error(
      'As of 1.0.0, you must wrap bindings with ' +
      'touch() instead of view.use(touch)'
    )
  }

  bindings || (bindings = {})
  opts = opts ? xtend(defaults, opts) : xtend(defaults)

  for(var name in opts) {
    var o = opts[name]
    if (!o.recognizer) o.recognizer = guessRecognizer(name)
    bind(bindings, name, o)
  }
}

function bind(bindings, name, opts) {
  var suffixes = eventSuffixes[opts.recognizer] || []

  // For the main event
  suffixes.push('')

  // One binding per event
  suffixes.forEach(function(suffix){
    var event = name + suffix // eg swipe + left

    bindings['on-' + event] = function(el, method) {
      if (!method) method = event

      var react   = this.reactive
        , manager = getManager(el, name, opts, react)

      manager.on(event, function(ev){
        callMethod(react.view, method, [ev, react])
      })
    }
  })
}

function getManager(el, name, opts, reactive) {
  var manager = el.hammer
  
  // Create Manager
  if (manager == null) {
    manager = el.hammer = new Hammer.Manager(el)
    manager.onCreated = {}
    reactive.on('destroyed', function() {
      el.hammer.destroy()
      delete el.hammer
    })
  }

  // Create Recognizer
  if (manager[name] == null) {
    var recog = new Hammer[opts.recognizer](opts)
    manager[name] = recog
    manager.add(recog)

    // Set recognizer options
    getOptions(recog).forEach(function(option){
      var expr = el.getAttribute(name + '-' + option)
      if (expr == null) return

      if (utils.hasInterpolation(expr)) {
        // Subscribe
        var props = utils.interpolationProps(expr)

        props.forEach(function (prop) {
          reactive.sub(prop, update)
        })

        // Set or update
        (function update() {
          var raw = utils.interpolate(expr, function (prop, fn) {
            return fn ? fn(reactive) : reactive.get(prop)
          })
          setOption(recog, option, raw)
        })()
      } else {
        // expr is value
        setOption(recog, option, expr)
      }
    })

    // Get per-element or per-view option
    function option(attr, optKey, cb) {
      var val = el.getAttribute(name+'-'+attr) || opts[optKey || attr]
      if (val != null) (cb || optKey)(val)
    }

    // Dependencies between recognizers
    option('with', 'recognizeWith', function(rwith){
      getRecognizer(manager, rwith, function(other){
        recog.recognizeWith(other)
      })
    })

    option('require-failure', 'requireFailure', function(req){
      getRecognizer(manager, req, function(other){
        recog.requireFailure(other)
      })
    })

    // Advanced configuration
    option('setup', function(setup){
      callMethod(reactive.view, setup, [el, recog, reactive])
    })

    // Call "listeners"
    if (manager.onCreated[name]) {
      var queue = manager.onCreated[name]
      delete manager.onCreated[name]
      for (var i = queue.length-1; i>=0; i--)
        queue[i](recog)
    }
  }

  return manager
}

function guessRecognizer(name) {
  name = name.toLowerCase()

  for (var i = recognizers.length - 1; i >= 0; i--) {
    if (name.indexOf(recognizers[i].toLowerCase())>=0)
      return recognizers[i]
  }

  throw new Error(
    'Could not guess recognizer name, please set opts.recognizer'
  )
}

function getRecognizer(manager, name, cb) {
  if (manager[name]) return cb(manager[name])

  var queue = manager.onCreated
  if (queue[name]) queue[name].push(cb)
  else queue[name] = [cb]
}

function callMethod(view, method, args) {
  var fn = view[method]
  if (!fn) throw new Error('method .' + method + '() missing')
  return fn.apply(view, args)
}

function getOptions(recog) {
  var names  = []

  for(var k in recog.defaults)
    if (k!=='event') names.push(k)

  if (names.indexOf('enable')<0)
    names.push('enable')

  return names
}

function setOption(recog, option, raw) {
  var parser = optionParsers[option] || parseInt
    , opts   = {}

  opts[option] = parser(raw)
  recog.set(opts)
}