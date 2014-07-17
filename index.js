var Hammer = require('hammerjs')
  , defaults = { enable: true }
  , recognizers = list()

module.exports = function(instance) {
  for(var name in recognizers) {
    addBindings(instance, name, recognizers[name])
  }
}

function addBindings(instance, name, suffixes) {
  // tap, swipe, etc.
  var main = name.toLowerCase()

  // For the main event
  suffixes.push('')

  // One binding per event
  suffixes.forEach(function(suffix){
    var event   = main + suffix // eg swipe + left
      , binding = 'on-' + event

    instance.bind(binding, function(el, method) {
      var reactive = this.reactive
        , view     = reactive.view

      // Metadata for element
      var store = el.touchBinding || (el.touchBinding = {})
      
      if (store.mc == null)
        store.mc = createManager(el, reactive)
      if (store[name] == null)
        createRecognizer(name, el, view, store)

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
    delete el.store
  })

  return mc
}

// Create Hammer recognizer
function createRecognizer(name, el, view, store) {
  var recog = new Hammer[name](defaults)
  
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
      return
    }
  }
    
  store.setup.call(view, el, recog)
}

function list() { 
  var directions = ['left', 'right', 'up', 'down']
  var events = ['start', 'move', 'end', 'cancel']

  return {
      Pan: events.concat(directions)
    , Pinch: events.concat(['in', 'out'])
    , Press: []
    , Rotate: events
    , Swipe: directions
    , Tap: []
  }
}