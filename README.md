<p align="center">
    🚧 WIP 🚧
</p>
<h1 align="center">Loco(native) Scroll</h1>
<p align="center">
Detection of elements in viewport & smooth native scrolling.<br>
The great locomotive-scroll without Smooth Class, merged with Lenis by Studio Freight to optimize the scrolling experience and keep native scrolling. I decided to merge the best of (for me) 2 great librairies for scrolling experiences.</p>

<p align="center">No more Smooth Class = no more hikacking of the scroll.</p>

<h2>Why locomotive-scroll as base ?</h2>

<p>Great managment and detections of everything linked to the scroll. <a href="https://github.com/locomotivemtl/locomotive-scroll" target="_blank">See more.</a><p>

<ul>
    <li>In view class on scoped elements</li>
    <li>JS callback to call everything you want when an element is in the viewport</li>
    <li>Get the progress from the bottom to the top of each current elements (currently in the viewport)</li>
    <li>Choose if the detection is repeatable or not</li>
    <li>Context managment to set different options on tablet, mobile and desktop</li>
</ul>

<h2>Why add Lenis by Studio Freight ?</h2>

<p>Native smooth scrolling without scroll hijacking. <a href="https://github.com/studio-freight/lenis" target="_blank">See more.</a><p>

<ul>
    <li>Performant</li>
    <li>Native scrolling</li>
    <li>Lightweight</li>
    <li>Great for accessibility</li>
</ul>


## Installation

```sh
npm install https://github.com/quentinhocde/loconative-scroll
```

## Usage

#### CSS
Add the base styles to your CSS file.

[`loconative-scroll.css`](https://github.com/quentinhocde/loconative-scroll/blob/master/dist/loconative-scroll.css)

### Basic
With simple detection, when your element will enter in the viewport, the `in-view` class will be added.

#### HTML
```html
<h1 data-scroll>Hey</h1>
<p data-scroll>👋</p>
```

#### JS

##### With a bundler
```js
import LoconativeScroll from 'loconative-scroll';

const scroll = new LoconativeScroll();
```

##### Or without
```js
<script src="loconative-scroll.min.js"></script>
<script>
    (function () {
        var scroll = new LoconativeScroll();
    })();
</script>
```
_Get the [JS file](https://github.com/quentinhocde/loconative-scroll/blob/master/dist/loconative-scroll.min.js)._

### Smooth
With smooth scrolling.

```js
import LoconativeScroll from 'loconative-scroll';

const scroll = new LoconativeScroll({
    smooth: true
});
```

### Advanced
Make it do what you want.

#### With methods
```html
<section id="js-target">Come here please.</section>
```

```js
import LoconativeScroll from 'loconative-scroll';

const scroll = new LoconativeScroll();
const target = document.querySelector('#js-target');

scroll.scrollTo(target);
```

### DOM data-attributes shortcuts
```html
<a href="#mySection" data-scroll-to>Go to my section</a> 
```

#### With events

```html
<!-- Using modularJS -->
<div data-scroll data-scroll-call="function, module, moduleID">Trigger</div>
<!-- Using jQuery events -->
<div data-scroll data-scroll-call="EVENT_NAME">Trigger</div>
<!-- Or do it your own way 😎 -->
<div data-scroll data-scroll-call="{y,o,l,o}">Trigger</div>
```

```js
import LoconativeScroll from 'loconative-scroll';

const scroll = new LoconativeScroll();

scroll.on('call', (func, way, obj) => {
    
    // func = [function, module, moduleID]
    // way = 'enter' or 'leave'
    // obj = JS object from loconative-scroll

});
```

## Instance options

| Option                  | Type      | Default                | Description                                                                                                                                                                                                                                                                                        |
| ----------------------- | --------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `el`                    | `DOMElement`  | `document`             | Scroll container |
| `wrapper`               | `DOMElement`  | `window`             | Scroll wrapper, important to add a custom wrapper if you want multiple loconative-scroll in a page. The mousewheel event will be catch on it |
| `name`                  | `string`  | `'scroll'`             | Data attribute prefix (`data-scroll-xxxx`).                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                               |
| `offset`                | `array(2)`| `[0,0]`                | Global in-view trigger offset : `[bottom,top]`<br>Use a string with `%` to use a percentage of the viewport height.<br>Use a numeric value for absolute pixels unit.<br>E.g. `["30%",0]`, `[100,0]`, `["30%", 100]`                                                                                |
| `repeat`                | `boolean` | `false`                | Repeat in-view detection.                                                                                                                                                                                                                                                                          |
| `smooth`                | `boolean` | `true`                | Native smooth scrolling. |
| `initPosition`          | `object`  | `{ x: 0, y: 0 }`       | ![Smooth only][smooth-only]<br>An `object` defining the initial scroll coordinates on a smooth instance. For example: `{ x: 0, y: 1000 }` |
| `direction`             | `string`  | `vertical`             | ![Smooth only][smooth-only]<br>Scroll direction: `vertical` or `horizontal`|
| `gestureDirection`             | `string`  | `vertical`             | ![Smooth only][smooth-only]<br>Your gesture direction on your trackpad/magic mouse or your touch devices. `vertical` or `horizontal`|
| `duration`                  | `number`  | `1.2`                  | ![Smooth only][smooth-only]             |
| `easing`                  | `function`  | `(t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))` | ![Smooth only][smooth-only] </br>https://easings.net |
| `scrollToEasing`                  | `function`  | `(t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))` | ![Smooth only][smooth-only] </br>https://easings.net |
| `class`                 | `string`  | `is-inview`            | Element in-view class.                                                                                                                                                                                                                                                                             |
| `initClass`             | `string`  | `has-scroll-init`      | Initialize class.                                                                                                                                                                                                                                                                                  |
| `scrollingClass`        | `string`  | `has-scroll-scrolling` | Is scrolling class.                                                                                                                                                                                                                                                                                |
| `smoothClass`           | `string`  | `has-scroll-smooth`    | Has smooth scrolling class.   |
| `multiplier`            | `number`  | `1`                    | ![Smooth only][smooth-only]<br>Factor applied to the scroll delta, allowing to boost/reduce scrolling speed (regardless of the platform).                                                                                                                                                          |
| `firefoxMultiplier`     | `number`  | `50`                   | ![Smooth only][smooth-only]<br>Boost scrolling speed of Firefox on Windows.                                                                                                                                                                                                                        |
| `touchMultiplier`       | `number`  | `3`                    | ![Smooth only][smooth-only]<br>Multiply touch action to scroll faster than finger movement.                                                                                                                                                                                                         |
| `scrollFromAnywhere`    | `boolean` | `false`                | ![Smooth only][smooth-only]<br>By default loconative-scroll listens for scroll events only on the scroll container (`el` option). With this option set to true, it listens on the whole document instead.                                                                                          |
| `tablet` & `smartphone` | `object`  |                        | Object allowing to override some options for a particular context. You can specify: <ul><li>`smooth`</li><li>`direction`</li><li>`gestureDirection`</li></ul>For `tablet` context you can also define `breakpoint` (_integer_, defaults to 1190) to set the max-width breakpoint for tablets.     |
| `reloadOnContextChange` | `boolean` | `false`                | Allows to reload the page when switching between `desktop`, `tablet` and `smartphone` contexts. It can be useful if your page changes a lot between contexts and you want to reset everything.                                                                                                     |
| `resetNativeScroll` | `boolean` | `true`                | Sets `history.scrollRestoration = 'manual'` and calls `window.scrollTo(0, 0)` on loconative-scroll init in Native Class. Useful if you use transitions with native scrolling, otherwise we advise to set it to `false` if you don't want to break History API's scroll restoration feature. |

## Element attributes

| Attribute               | Values                   | Description                                                                              |
| ----------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `data-scroll`           |                          | Detect if in-view.                                                                       |
| `data-scroll-id`        | `string`                 | (Optional) Useful if you want to scope your element and get the progress of your element in the viewport for example. |
| `data-scroll-container` |                          | Defines the scroll container. Required for [basic styling](https://github.com/quentinhocde/loconative-scroll/blob/master/dist/loconative-scroll.css).                                                                                     |
| `data-scroll-section`   |                          | Defines a scrollable section. Splitting your page into sections may improve performance. |
| `data-scroll-class`     | `string`                 | Element in-view class.                                                                   |
| `data-scroll-offset`    | `string`                 | Element in-view trigger offset : `bottom,top`<br>First value is `bottom` offset, second (optional) is `top` offset.<br> Percent is relative to viewport height, otherwise it's absolute pixels.<br>E.g. `"10"`, `"100,50%"`, `"25%, 15%"`  |
| `data-scroll-repeat`    | `boolean`                | Element in-view detection repeat.                                                        |
| `data-scroll-call`      | `string`                 | Element in-view trigger call event.                                                      |
| `data-scroll-position`  | `string`                 | `top`, `bottom`, `left` or `right`<br>Window position of in-view trigger.                |
| `data-scroll-speed`     | `number`                 | ![Smooth only][smooth-only]<br>Element parallax speed. A negative value will reverse the direction. |                          |
| `data-scroll-direction` | `string`                 | ![Smooth only][smooth-only]<br>Element's parallax direction. `vertical` or `horizontal`  |
| `data-scroll-sticky`    |                          | <strong>Deprecated</strong> <br> Have fun and use `position: sticky` |
| `data-scroll-target`    | `string`                 | ![Smooth only][smooth-only]<br>Target element's in-view position.                        |

## Instance methods

| Method                     | Description                    | Arguments                                                                       |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `init()`                   | Reinitializes the scroll.      |                                                                                 |
| `on(eventName, function)`  | Listen [instance events] ⬇.    |                                                                                 |
| `update()`                 | Updates all element positions. |                                                                                 |
| `destroy()`                | Destroys the scroll events.    |                                                                                 |
| `start()`                  | Restarts the scroll events.    |                                                                                 |
| `stop()`                   | Stops the scroll events.       |                                                                                 |
| `scrollTo(target, options)`| Scroll to a target.            | <div>`target`: Defines where you want to scroll. Available values types are :<ul><li>`node` : a dom element</li><li>`string` : you can type your own selector, or use values `"top"` and `"bottom"` to reach scroll boundaries</li><li>`int` : An absolute scroll coordinate in pixels</li></ul></div><div>`options` (optional, _object_) : Settings object. Available values are: <ul><li>`offset` (_integer_) : Defines an offset from your target. E.g. `-100` if you want to scroll 100 pixels above your target</li><li>`duration` (_integer_) : Defines the duration of the scroll animation in seconds.<br>![Smooth only][smooth-only]</li><li>`immediate` (_boolean_) <br>![Smooth only][smooth-only]</li></ul> |

## Instance events

| Event    | Arguments | Description                                                           |
| -------- | --------- | --------------------------------------------------------------------- |
| `scroll` | `obj`     | Returns scroll instance (position, limit, speed, direction and current in-view elements).          |
| `call`   | `func`    | Trigger if in-view. Returns your `string` or `array` if contains `,`. |

## Progressive playing animations example (like gsap)
All `data-scroll` elements have a progress value.
In the on scroll event you can get all current in-view elements.
#### HTML
```html
<h1 data-scroll data-scroll-id="hey">Hey</h1>
```
#### JS
```js
scroll.on('scroll', (args) => {
    // Get all current elements : args.currentElements
    if(typeof args.currentElements['hey'] === 'object') {
        let progress = args.currentElements['hey'].progress;
        console.log(progress);
        // ouput log example: 0.34
        // gsap example : myGsapAnimation.progress(progress);
    }
});
```

## How to switch from locomotive-scroll to loconative-scroll
⚠️ Disclaimer ⚠️  
locomotive-scroll has more 37k+ downloads per month so it's impossible to manage every cases. Due to the update of the scroll system (from container translate to a native scroll) the switch will not be really seamless.
<br>
If you have multiple loconative-scroll instances in a page, don't forget to add `wrapper` option to catch the mousewheel on it and not on the window.
Let every data-attributes and options as is.
You can try to switch your projet on loconative-scroll with these following steps

```
npm install https://github.com/quentinhocde/loconative-scroll --save
```

In your Javascript, replace LocomotiveScroll instance and imports
```
import LoconativeScroll from 'loconative-scroll';

const scroll = new LoconativeScroll();
```

Make sure you remove all LS related CSS on `<html>` and `<body>`, and update your CSS :
```
html {
    scroll-behavior: initial;
}

html,
body {
    width: 100%;
    min-height: 100%;
}
```

[instance events]: #instance-events
[Virtual Scroll]: https://github.com/ayamflow/virtual-scroll
[Lenis]: https://github.com/studio-freight/lenis/


## Dependencies

| Name             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| [Virtual Scroll] | Custom scroll event with inertia/momentum.                         |
| [Lenis]  | Elements in viewport detection. Forked from it, not a dependency.  |

[instance events]: #instance-events
[Virtual Scroll]: https://github.com/ayamflow/virtual-scroll
[Lenis]: https://github.com/studio-freight/lenis/

## Browser support

Works on most modern browsers. Chrome, Firefox, Safari, Edge...


## Related

- [Locomotive Scroll 🚂](https://github.com/locomotivemtl/loconative-scroll)
- [Locomotive Boilerplate 🚂](https://github.com/locomotivemtl/locomotive-boilerplate)

[smooth-only]: https://img.shields.io/badge/smooth-only-blue
