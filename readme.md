# reactive-touch (work in progress)

> Touch bindings for [reactive-component](https://github.com/component/reactive) with [Hammer](https://hammerjs.github.io/). Use on-swipe, on-tap, on-rotate and many more in your reactive views.

* [Example](#example)
* [Plugin usage](#plugin-usage)
* [Reactive bindings](#reactive-bindings)
* [Configuration](#configuration)
* [Install](#install)
* [License](#license)

## Example

The function signature is the same as reactive's built-in `on-click`.

```js
var reactive = require('reactive')
  , touch = require('reactive-touch')

var template = 
  '<div on-swipeleft="swipe">Touch this</div>'

var handlers = {
  swipe: function(ev, ctx) {
    console.log(ev.gesture.direction === 'left') // true
  }
}

var view  = reactive(template, {}, {
  delegate: handlers
})

view.use(touch)
```

## Plugin usage

```js
var touch = require('reactive-touch')
var view  = reactive(template, model)

view.use(touch)
```

## Reactive bindings

After including the plugin, you can use the following bindings in your view. Follow the links for a full list of events. Always prefix the Hammer event name with "on-".

- [on-swipe](https://hammerjs.github.io/recognizer-swipe.html), on-swipeleft, etc
- [on-pan](https://hammerjs.github.io/recognizer-pan.html), ..
- [on-pinch](https://hammerjs.github.io/recognizer-pinch.html), ..
- [on-press](https://hammerjs.github.io/recognizer-press.html)
- [on-rotate](https://hammerjs.github.io/recognizer-rotate.html), ..
- [on-tap](https://hammerjs.github.io/recognizer-tap.html)

## Configuration

Each element with one or more touch bindings, gets his own [set of recognizers](https://hammerjs.github.io/getting-started.html#more-control), encapsulated in a manager. These recognizers can be configured by adding a `touch-setup` attribute with a method name. The method will be called once for each element+recognizer pair. *Note: this API might change, once reactive supports method arguments or something similar.*

```js
var template = 
  '<img on-swipedown="swipe" touch-setup="configure">'

var handlers = {
  swipe: ..
  configure: function(element, Swipe) {
    // Set the minimal distance required 
    // before recognizing a swipe.
    Swipe.set({distance: 50})
  }
}
```

## Install

With npm via [browserify](http://browserify.org/):

    npm i reactive-touch

## Manual testing

    npm i -g browserify
    npm run test-bundle

Then open test/index.html in a browser. In Chrome, tick "Emulate touch screen" in devtools.

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)

Hammer: [MIT](http://opensource.org/licenses/MIT) © 2011-2014 Jorik Tangelder (Eight Media)