# reactive-touch

Configurable touch bindings for [reactive](https://github.com/component/reactive) with [Hammer](https://hammerjs.github.io/). Use `on-swipe`, `on-tap`, `on-rotate` and many more in your reactive views. Also supports bindings for custom events, like `on-doubletap`.

> Jump to: [Quickstart](#quickstart) - [Example](#example) - [Usage](#usage) - [Install](#install) - [Test](#test) - [License](#license)

[![Build Status](https://saucelabs.com/browser-matrix/reactive-touch-sauce.svg)](https://travis-ci.org/vweevers/reactive-touch)

See [Hammer browser support](https://hammerjs.github.io/browser-support.html) and [reactive](https://github.com/component/reactive) for actual browser support.

## Quickstart

```js
var reactive = require('reactive')
  , touch = require('reactive-touch')

var tpl  = '<div on-swipeleft>Swipe left</div>'
var view = reactive(tpl, null, {
  bindings: touch(),
  delegate: {
    swipeleft: function(ev, ctx) {
      console.log('you swiped left')
    }
  }
})
```

## Example

[ TODO: requirebin link ]

*template.html*
```html
<div on-swipeleft swipe-threshold="50" swipe-enable="{active}" on-tap="activate">
  <p>{active ? 'Swipe > 50px left' : 'Tap to activate'}</p>
  <p data-visible="active">You swiped {distance}px</p>
  <button data-visible="active" on-tap="tapBtn" on-mycustomtap="doubletapBtn">
    {tapped || 'Tap or doubletap me'}
  </button>
</div>
```

*example.js*
```js
var reactive = require('reactive')
  , touch = require('reactive-touch')
  , template = require('template.html')

var opts = {
  tap: { requireFailure: 'mycustomtap' },
  mycustomtap: {
    taps: 2,
    recognizeWith: 'tap'
  }
}

var model = { active: false, distance: 0 }

var view  = reactive(template, model, {
  bindings: touch(null, opts),
  delegate: {
    activate: function(ev, ctx) {
      ctx.set('active', true)
    },
    swipeleft: function(ev, ctx) {
      ctx.set('distance', ev.distance)
    },
    tapBtn: function(ev, ctx) {
      ctx.set('tapped', 'single')
    },
    doubletapBtn: function(ev, ctx) {
      ctx.set('tapped', 'double')
    }
  }
})
```

## Usage

`touch([bindings][, options])` extends your bindings object or if none given, creates a new bindings object. Both arguments are optional, see below for `options`.

>**Breaking change:** before 1.0.0, the plugin was loaded with `view.use(touch)`. This created problems with reactive's `each` binding and scope, because a reactive instance renders immediately (before `use()`). See (TODO: link to issue)

Your view can react to any Hammer event by adding element attributes in the form of `on-[event]="handler name"`. If no handler name is given, it is assumed to be the event name. These are the same:

```html
<div on-pan></div>
<div on-pan="pan"></div>
```

The handler will receive two arguments, similar to reactive's built-in `on-click`:

- `ev`: event data
- `ctx`: reactive instance

### Options

Each element with one or more touch bindings, gets his own [set of recognizers](https://hammerjs.github.io/getting-started.html#more-control). Recognizers can be configured per-view and per-element.

#### Per-element: option attributes

Add attributes in the form of `[recognizer]-[option]="value"`. Values will be interpolated if wrapped in brackets, and cast to integers, floats or booleans if necessary. Examples:

```html
<div on-pan pan-direction="horizontal"></div>
<div on-rotateend="rotate" rotate-threshold="{ modelProperty + 10 }"></div>
<div on-swipe swipe-velocity="0.65" swipe-direction="24"></div>
<div on-tap tap-taps="2">double tap</div>
<div on-tap tap-setup="specialTap"></div>
<div on-pinch on-rotate pinch-with="rotate"></div>
<div on-press press-enable="{ someMethod }"></div>
```

#### Per-view 

```js
touch(bindings, {
  swipe: {
    threshold: 100
  }
})
```

### Custom events

```html
<div on-tap on-doubletap></div>
```

```js
touch(bindings, {
  tap: {
    requireFailure: 'doubletap'
  },
  doubletap: {
    recognizer: 'Tap', // auto?
    taps: 2,
    recognizeWith: 'tap'
  }
})
```

### List of events and options

#### Common options

Every recognizer has these options.

**enable**: if `false`, no events will be emitted. Defaults to `true`.

**setup**: a view method name, called after recognizer is created and options are set. For advanced usage. Receives three arguments:

- `el`
- `recognizer`: Hammer Recognizer instance
- `ctx`: Reactive instance

See [todo: link to example] for an example implementation of a tap combined with a double tap.

#### Specifics

For **direction**, use a numerical value (from `Hammer.DIRECTION_*` constants) or a shorthand like `all`, `horizontal`, `left`, etc.

Please follow the links below for a description of the other options and the events.

| Recognizer | Events   | Options  
|:-----------|:---------|:------------------
| [Swipe](https://hammerjs.github.io/recognizer-swipe/) | swipe, swipeleft, swiperight, swipeup, swipedown | threshold, pointers, direction, velocity
| [Pan](https://hammerjs.github.io/recognizer-pan/) | pan, panstart, panmove, panend, pancancel, panleft, panright, panup, pandown | pointers, threshold, direction
| [Pinch](https://hammerjs.github.io/recognizer-pinch/) | pinch, pinchstart, pinchmove, pinchend, pinchcancel, pinchin, pinchout | pointers, threshold
| [Rotate](https://hammerjs.github.io/recognizer-rotate/) | rotate, rotatestart, rotatemove, rotateend, rotatecancel | pointers, threshold
| [Tap](https://hammerjs.github.io/recognizer-tap/) | tap | pointers, taps, interval, time, threshold, posThreshold
| [Press](https://hammerjs.github.io/recognizer-press/) | press | pointers, threshold, time

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
