# reactive-touch

> Touch bindings for [reactive](https://github.com/component/reactive) with [Hammer](https://hammerjs.github.io/). Use on-swipe, on-tap, on-rotate and many more in your reactive views.
>
> Jump to: [Example](#example) - [Usage](#usage) - [Install](#install) - [Test](#test) - [License](#license)

#### Build status

*See [Hammer browser support](https://hammerjs.github.io/browser-support.html) and [reactive](https://github.com/component/reactive) for actual browser support.*
[![Build Status](https://saucelabs.com/browser-matrix/reactive-touch-sauce.svg)](https://travis-ci.org/vweevers/reactive-touch)

## Example

The function signature is the same as reactive's built-in `on-click`.

```js
var reactive = require('reactive')
  , touch = require('reactive-touch')

var template = 
  '<div on-swipeleft="swipe">Touch this</div>'

var view  = reactive(template, {}, {
  delegate: {
    swipe: function(ev, ctx) {
      console.log('you swiped left')
    }
  }
})

view.use(touch)
```

## Usage

To use this plugin in your view:

```js
var touch = require('reactive-touch')
var view  = reactive(template, model)

view.use(touch)
```

The view can then react to any Hammer event. Prefix the event with "on-" to get the binding name. Follow the links below for a full list of events.

- [on-swipe](https://hammerjs.github.io/recognizer-swipe.html), on-swipeleft, etc
- [on-pan](https://hammerjs.github.io/recognizer-pan.html), ..
- [on-pinch](https://hammerjs.github.io/recognizer-pinch.html), ..
- [on-press](https://hammerjs.github.io/recognizer-press.html)
- [on-rotate](https://hammerjs.github.io/recognizer-rotate.html), ..
- [on-tap](https://hammerjs.github.io/recognizer-tap.html)

### Configuration

Each element with one or more touch bindings, gets his own [set of recognizers](https://hammerjs.github.io/getting-started.html#more-control), encapsulated in a manager. These recognizers can be configured by adding a `touch-setup` attribute with a method name. The method will be called once for each element+recognizer pair. *Note: this API might change, once reactive supports method arguments or something similar.*

```js
var template = 
  '<img on-swipedown="swipe" touch-setup="configure">'

var handlers = {
  swipe: ..
  configure: function(element, Swipe, ctx) {
    // Set the minimal distance required 
    // before recognizing a swipe.
    Swipe.set({distance: 50})
  }
}
```

## Install

    npm i reactive-touch

Then use [browserify](http://browserify.org/) to bundle for the browser.

## Test

    npm i zuul -g
    npm test

Or local:

    npm run test-local

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)
