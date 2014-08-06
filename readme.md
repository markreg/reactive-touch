# reactive-touch

Configurable touch bindings for [reactive](https://github.com/component/reactive) with [Hammer](https://hammerjs.github.io/). Use `on-swipe`, `on-tap`, `on-rotate` and many more in your reactive views. Also supports bindings for custom recognizers, like `on-doubletap`.

**Jump to**: [Quickstart](#quickstart) - [Live example](#live-example) - [Install](#install) - [Usage](#usage) - [Test](#test) - [License](#license)

## Browser support

[![Build Status](https://saucelabs.com/browser-matrix/reactive-touch-sauce.svg)](https://travis-ci.org/vweevers/reactive-touch)

See [Hammer browser support](https://hammerjs.github.io/browser-support.html) and [reactive](https://github.com/component/reactive) for actual browser support.

## Quickstart

```js
var reactive = require('reactive')
  , touch = require('reactive-touch')

var tpl  = '<div on-swipeleft="swipe">Swipe left</div>'
var view = reactive(tpl, null, {
  bindings: touch(),
  delegate: {
    swipe: function(ev, ctx) {
      console.log('you swiped left')
    }
  }
})
```

## Live example

This [live example](http://htmlpreview.github.io/?https://github.com/vweevers/reactive-touch/blob/master/example/index.html) demonstrates:

- Custom recognizers
- Reactive enabling of events
- Per-element and per-view options

## Install

    npm i reactive-touch

Then bundle for the browser with [browserify](http://browserify.org/).

## Usage

`touch([bindings][, options])`

- `bindings`: existing bindings to extend
- `options`: per-view options (see below)

### Handlers

Your view can react to any Hammer event by adding attributes in the form of `on-[event]="handler name"`. If no handler name is given, it is assumed to be the event name. These are the same:

```html
<div on-pan></div>
<div on-pan="pan"></div>
```

The handler will receive two arguments, similar to reactive's built-in `on-click`:

- `ev`: event data
- `ctx`: reactive instance

### Options

Each element with touch bindings gets a [set of recognizers](https://hammerjs.github.io/getting-started.html#more-control). Recognizers can be configured per-view and per-element.

#### Per-element

Add attributes in the form of `[recognizer]-[option]="value"`. Values will be interpolated if wrapped in brackets, and cast to integers, floats or booleans if necessary. Examples:

```html
<div on-pan pan-direction="horizontal"></div>
<div on-rotateend="rotate" rotate-threshold="{ modelProperty + 10 }"></div>
<div on-swipe swipe-velocity="0.65"></div>
<div on-tap tap-taps="2">double tap</div>
<div on-pinch on-rotate pinch-with="rotate"></div>
<div on-press press-enable="{ someMethod }"></div>
```

#### Per-view 

Group options by lowercase recognizer name.

```js
touch(bindings, {
  swipe: {
    threshold: 100
  }
})
```

### Custom recognizers

Simply add a group to `options` with a custom name. Optionally set `recognizer` - a lowercase recognizer name to extend. Required if the name doesn't contain a standard name. In the following example, `recognizer` could have been left out.

```html
<div on-tap on-doubletap></div>
```

```js
touch(bindings, {
  tap: {
    requireFailure: 'doubletap'
  },
  doubletap: {
    recognizer: 'tap',
    taps: 2,
    with: 'tap'
  }
})
```

### List of options

| Common           | Description
|:-----------------|:--------------
| *enable*         | If `false`, no events will be emitted. Defaults to `true`.
| *with*           | A lowercase recognizer name (e.g. `tap` or `mycustomtap`) to recognize simultaneously. Shortcut for [recognizeWith()](http://hammerjs.github.io/recognize-with/).
| *requireFailure* | A lowercase recognizer name that is required to fail before recognizing. Shortcut for [requireFailure()](http://hammerjs.github.io/require-failure/).
| *setup*          | A view method name, called after recognizer is created and options are set. For advanced usage. Receives three arguments: `el`, `recognizer` and `ctx`.

For `direction`, use a `Hammer.DIRECTION_*` constant or a shorthand like `all`, `horizontal`, `left`, etc. Please follow the links below for a description of the other options.

| Recognizer | Options  
|:-----------|:----------
| [Swipe](https://hammerjs.github.io/recognizer-swipe/) | threshold, pointers, direction, velocity
| [Pan](https://hammerjs.github.io/recognizer-pan/) | pointers, threshold, direction
| [Pinch](https://hammerjs.github.io/recognizer-pinch/) | pointers, threshold
| [Rotate](https://hammerjs.github.io/recognizer-rotate/) | pointers, threshold
| [Tap](https://hammerjs.github.io/recognizer-tap/) | pointers, taps, interval, time, threshold, posThreshold
| [Press](https://hammerjs.github.io/recognizer-press/) | pointers, threshold, time

### List of events

| Recognizer | Events   
|:-----------|:---------
| [Swipe](https://hammerjs.github.io/recognizer-swipe/) | swipe, swipeleft, swiperight, swipeup, swipedown
| [Pan](https://hammerjs.github.io/recognizer-pan/) | pan, panstart, panmove, panend, pancancel, panleft, panright, panup, pandown
| [Pinch](https://hammerjs.github.io/recognizer-pinch/) | pinch, pinchstart, pinchmove, pinchend, pinchcancel, pinchin, pinchout
| [Rotate](https://hammerjs.github.io/recognizer-rotate/) | rotate, rotatestart, rotatemove, rotateend, rotatecancel
| [Tap](https://hammerjs.github.io/recognizer-tap/) | tap
| [Press](https://hammerjs.github.io/recognizer-press/) | press

## Test

    npm i zuul -g
    npm test

Or local:

    npm run test-local

## License

[MIT](http://opensource.org/licenses/MIT) © [Vincent Weevers](http://vincentweevers.nl)
