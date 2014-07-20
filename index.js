var Hammer = require('hammerjs')
  , defaults = { enable: true }

module.exports = function(instance) {
  if (instance == null || typeof instance.bind !== 'function')
    throw new Error('Requires Reactive instance')

  var directions = ['left', 'right', 'up', 'down']
  var events = ['start', 'move', 'end', 'cancel']

  bind( instance, 'Pan',    events.concat(directions) )
  bind( instance, 'Pinch',  events.concat(['in', 'out']) )
  bind( instance, 'Press',  [] )
  bind( instance, 'Rotate', events )
  bind( instance, 'Swipe',  directions )
  bind( instance, 'Tap',    [] )
}

function bind(instance, name, suffixes) {
  // tap, swipe, etc.
  var main = name.toLowerCase()

  // For the main event
  suffixes.push('')

  // One binding per event
  suffixes.forEach(function(suffix){
    var event   = main + suffix // eg swipe + left
      , binding = 'on-' + event

    instance.bind(binding, function(el, method) {
      if (!method) throw new Error('method name missing')

      var reactive = this.reactive
        , view     = reactive.view

      // Metadata for element
      var store = el.touchBinding || (el.touchBinding = {})
      
      if (store.mc == null)
        store.mc = createManager(el, reactive)
      if (store[name] == null)
        createRecognizer(name, el, reactive, store)

      store.mc.on(event, function(ev){
        // ev.preventDefault?
        var fn = view[method]
        if (!fn) throw new Error('method .' + method + '() missing')
        fn.call(view, ev, reactive)
      })
    })
  })
}

// Create Hammer manager
function createManager(el, reactive) {
  var mc = new Hammer.Manager(el)

  reactive.on('destroyed', function() {
    mc.destroy()
    delete el.touchBinding
  })

  return mc
}

// Create Hammer recognizer
function createRecognizer(name, el, reactive, store) {
  var recog = new Hammer[name](defaults)
  var view = reactive.view

  store[name] = recog
  store.mc.add(recog)

  // Find optional setup fn (once) and call it
  if (store.setup == null) {
    var method = el.getAttribute('touch-setup')

    if (method) {
      var fn = view[method]
      if (!fn) throw new Error('method .' + method + '() missing')
      store.setup = fn
    } else {
      store.setup = false
    }
  }
    
  store.setup && store.setup.call(view, el, recog, reactive)
}
