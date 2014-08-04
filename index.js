var Hammer  = require('hammerjs')
  , utils   = require('reactive/lib/utils')

module.exports = function(bindings) {
  // Ensure it's not a Reactive instance
  if (bindings && bindings.bindings) {
    throw new Error(
      'As of 1.0.0, you must wrap bindings with ' +
      'touch() instead of view.use(touch)'
    )
  }

  if (!bindings) bindings = {}

  var directions = [ 'left', 'right', 'up', 'down' ]
    , events     = [ 'start', 'move', 'end', 'cancel' ]

  bind( bindings, 'Pan',    events.concat(directions))
  bind( bindings, 'Pinch',  events.concat(['in', 'out']))
  bind( bindings, 'Press',  [])
  bind( bindings, 'Rotate', events)
  bind( bindings, 'Swipe',  directions)
  bind( bindings, 'Tap',    [])
}

// Parse functions for option attributes; 
// default (most common) is "parseInt"
var optionParsers = 
  { velocity: parseFloat
  , enable: function(val) {
      if (val=='false') return false
      else return !!val
    }
  , direction: function(val) {
      var constant = Hammer['DIRECTION_' + val.toUpperCase()]
      return constant != null ? constant : parseInt(val)
    }
  }

function bind(bindings, name, suffixes, options) {
  // tap, swipe, etc.
  var main = name.toLowerCase()

  // For the main event
  suffixes.push('')

  // One binding per event
  suffixes.forEach(function(suffix){
    var event = main + suffix // eg swipe + left

    bindings['on-' + event] = function(el, method) {
      if (!method) method = event

      var react   = this.reactive
        , manager = getManager(el, name, react)

      manager.on(event, function(ev){
        callMethod(react.view, method, [ev, react])
      })
    }
  })
}

function getManager(el, name, reactive) {
  var manager = el.hammer
  
  // Create Manager
  if (manager == null) {
    manager = el.hammer = new Hammer.Manager(el)
    reactive.on('destroyed', function() {
      el.hammer.destroy()
      delete el.hammer
    })
  }

  // Create Recognizer
  if (manager[name] == null) {
    var recog = new Hammer[name]({ enable: true })
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

    // Advanced configuration
    var setup = el.getAttribute(name + '-setup')
    if (setup != null) {
      callMethod(reactive.view, setup, [el, recog, reactive])
    }
  }

  return manager
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