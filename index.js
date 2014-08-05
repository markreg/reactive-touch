var Hammer  = require('hammerjs')
  , utils   = require('reactive/lib/utils')
  // , extend  = require('extend')

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
      return val=='false' || val=='undefined' ? false : !!val
    }
  , direction: function(val) {
      if (typeof val == 'number') return val
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

  var merged = {}, name, opt

  for(name in defaults) {
    merged[name] = {}
    for(opt in defaults[name])
      merged[name][opt] = defaults[name][opt]
  }

  if (opts) {
    for(name in opts) {
      merged[name] || (merged[name] = {})
      for(opt in opts[name])
        merged[name][opt] = opts[name][opt]
    }
  }

  for(var name in merged) {
    var group = merged[name]
    if (!group.recognizer)
      group.recognizer = guessRecognizer(name)
    if (group.direction)
      group.direction = optionParsers.direction(group.direction)
    bind(bindings, name, group)
  }

  return bindings
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
    opts.event = name
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

        // Initial
        update()

        function update() {
          var raw = utils.interpolate(expr, function (prop, fn) {
            return fn ? fn(reactive) : reactive.get(prop)
          })
          setOption(recog, option, raw)
        }
      } else {
        // expr is value
        setOption(recog, option, expr)
      }
    })

    // Get per-element or per-view option
    function option(key) {
      return el.getAttribute(name+'-'+key) || opts[key]
    }

    // Dependencies between recognizers
    var rw = option('with')
    rw && getRecognizer(manager, rw, function(other){
      recog.recognizeWith(other)
    })

    var rf = option('requireFailure')
    rf && getRecognizer(manager, rf, function(other){
      
      // must change order for 
      // requireFailure to work
      manager.add(other)
      manager.add(recog)

      recog.requireFailure(other)
    })

    // Advanced configuration
    var setup = option('setup')
    setup && callMethod(reactive.view, setup, [el, recog, reactive])

    // Callback dependant recognizers
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
  var fn = typeof method=='function' ? method : view[method]
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