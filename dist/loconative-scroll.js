/* loconative-scroll v1.0.3 | MIT License | https://github.com/quentinhocde/loconative-scroll */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.LoconativeScroll = factory());
})(this, (function () { 'use strict';

    const defaults = {
      el: document.querySelector('body'),
      wrapper: window,
      name: 'scroll',
      offset: [0, 0],
      repeat: false,
      smooth: true,
      initPosition: {
        x: 0,
        y: 0
      },
      direction: 'vertical',
      gestureDirection: 'vertical',
      reloadOnContextChange: true,
      class: 'is-inview',
      scrollingClass: 'has-scroll-scrolling',
      smoothClass: 'has-scroll-smooth',
      initClass: 'has-scroll-init',
      duration: 1.2,
      easing: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      // https://easings.net,
      scrollToEasing: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      // https://easings.net
      scrollFromAnywhere: false,
      touchMultiplier: 3,
      resetNativeScroll: true,
      tablet: {
        smooth: false,
        direction: 'vertical',
        gestureDirection: 'horizontal',
        breakpoint: 1024
      },
      smartphone: {
        smooth: false,
        direction: 'vertical',
        gestureDirection: 'vertical'
      }
    };

    class Core {
      constructor() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        Object.assign(this, defaults, options);
        this.smartphone = defaults.smartphone;
        if (options.smartphone) Object.assign(this.smartphone, options.smartphone);
        this.tablet = defaults.tablet;
        if (options.tablet) Object.assign(this.tablet, options.tablet);
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 || this.windowWidth < this.tablet.breakpoint;
        this.isTablet = this.isMobile && window.innerWidth >= this.tablet.breakpoint;
        if (this.isMobile) {
          this.smooth = this.smartphone.smooth;
        }
        if (this.isTablet) {
          this.smooth = this.tablet.smooth;
        }
        this.namespace = 'locomotive';
        this.html = document.documentElement;
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowMiddle = {
          x: this.windowWidth / 2,
          y: this.windowHeight / 2
        };
        this.els = {};
        this.currentElements = {};
        this.listeners = {};
        this.hasScrollTicking = false;
        this.hasCallEventSet = false;
        this.onScroll = this.onScroll.bind(this);
        this.checkResize = this.checkResize.bind(this);
        this.checkEvent = this.checkEvent.bind(this);
        this.instance = {
          scroll: {
            x: 0,
            y: 0
          },
          delta: {
            x: 0,
            y: 0
          },
          limit: {
            x: this.html.offsetWidth,
            y: this.html.offsetHeight
          },
          currentElements: this.currentElements
        };
        if (this.isMobile) {
          if (this.isTablet) {
            this.context = 'tablet';
          } else {
            this.context = 'smartphone';
          }
        } else {
          this.context = 'desktop';
        }
        if (this.isMobile) this.direction = this[this.context].direction;
        if (this.isMobile) this.gestureDirection = this[this.context].gestureDirection;
        if (this.direction === 'horizontal') {
          this.directionAxis = 'x';
        } else {
          this.directionAxis = 'y';
        }
        this.instance.direction = null;
        this.instance.speed = 0;
        this.html.classList.add(this.initClass);
        window.addEventListener('resize', this.checkResize, false);
      }
      init() {
        this.initEvents();
      }
      onScroll() {
        this.dispatchScroll();
      }
      checkResize() {
        if (!this.resizeTick) {
          this.resizeTick = true;
          requestAnimationFrame(() => {
            this.resize();
            this.resizeTick = false;
          });
        }
      }
      resize() {}
      checkContext() {
        if (!this.reloadOnContextChange) return;
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 || this.windowWidth < this.tablet.breakpoint;
        this.isTablet = this.isMobile && this.windowWidth >= this.tablet.breakpoint;
        let oldContext = this.context;
        if (this.isMobile) {
          if (this.isTablet) {
            this.context = 'tablet';
          } else {
            this.context = 'smartphone';
          }
        } else {
          this.context = 'desktop';
        }
        if (oldContext != this.context) {
          let oldSmooth = oldContext == 'desktop' ? this.smooth : this[oldContext].smooth;
          let newSmooth = this.context == 'desktop' ? this.smooth : this[this.context].smooth;
          if (oldSmooth != newSmooth) window.location.reload();
        }
      }
      initEvents() {
        this.scrollToEls = this.el.querySelectorAll(`[data-${this.name}-to]`);
        this.setScrollTo = this.setScrollTo.bind(this);
        this.scrollToEls.forEach(el => {
          el.addEventListener('click', this.setScrollTo, false);
        });
      }
      setScrollTo(event) {
        event.preventDefault();
        this.scrollTo(event.currentTarget.getAttribute(`data-${this.name}-href`) || event.currentTarget.getAttribute('href'), {
          offset: event.currentTarget.getAttribute(`data-${this.name}-offset`)
        });
      }
      addElements() {}
      detectElements(hasCallEventSet) {
        const scrollTop = this.instance.scroll.y;
        const scrollBottom = scrollTop + this.windowHeight;
        const scrollLeft = this.instance.scroll.x;
        const scrollRight = scrollLeft + this.windowWidth;
        Object.entries(this.els).forEach(_ref => {
          let [i, el] = _ref;
          if (el && (!el.inView || hasCallEventSet)) {
            if (this.direction === 'horizontal') {
              if (scrollRight >= el.left && scrollLeft < el.right) {
                this.setInView(el, i);
              }
            } else {
              if (scrollBottom >= el.top && scrollTop < el.bottom) {
                this.setInView(el, i);
              }
            }
          }
          if (el && el.inView) {
            if (this.direction === 'horizontal') {
              let width = el.right - el.left;
              el.progress = (this.instance.scroll.x - (el.left - this.windowWidth)) / (width + this.windowWidth);
              if (scrollRight < el.left || scrollLeft > el.right) {
                this.setOutOfView(el, i);
              }
            } else {
              let height = el.bottom - el.top;
              el.progress = (this.instance.scroll.y - (el.top - this.windowHeight)) / (height + this.windowHeight);
              if (scrollBottom < el.top || scrollTop > el.bottom) {
                this.setOutOfView(el, i);
              }
            }
          }
        });

        // this.els = this.els.filter((current, i) => {
        //     return current !== null;
        // });

        this.hasScrollTicking = false;
      }
      setInView(current, i) {
        this.els[i].inView = true;
        current.el.classList.add(current.class);
        this.currentElements[i] = current;
        if (current.call && this.hasCallEventSet) {
          this.dispatchCall(current, 'enter');
          if (!current.repeat) {
            this.els[i].call = false;
          }
        }

        // if (!current.repeat && !current.speed && !current.sticky) {
        //     if (!current.call || current.call && this.hasCallEventSet) {
        //        this.els[i] = null
        //     }
        // }
      }

      setOutOfView(current, i) {
        // if (current.repeat || current.speed !== undefined) {
        this.els[i].inView = false;
        // }

        Object.keys(this.currentElements).forEach(el => {
          el === i && delete this.currentElements[el];
        });
        if (current.call && this.hasCallEventSet) {
          this.dispatchCall(current, 'exit');
        }
        if (current.repeat) {
          current.el.classList.remove(current.class);
        }
      }
      dispatchCall(current, way) {
        this.callWay = way;
        this.callValue = current.call.split(',').map(item => item.trim());
        this.callObj = current;
        if (this.callValue.length == 1) this.callValue = this.callValue[0];
        const callEvent = new Event(this.namespace + 'call');
        this.el.dispatchEvent(callEvent);
      }
      dispatchScroll() {
        const scrollEvent = new Event(this.namespace + 'scroll');
        this.el.dispatchEvent(scrollEvent);
      }
      setEvents(event, func) {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        const list = this.listeners[event];
        list.push(func);
        if (list.length === 1) {
          this.el.addEventListener(this.namespace + event, this.checkEvent, false);
        }
        if (event === 'call') {
          this.hasCallEventSet = true;
          this.detectElements(true);
        }
      }
      unsetEvents(event, func) {
        if (!this.listeners[event]) return;
        const list = this.listeners[event];
        const index = list.indexOf(func);
        if (index < 0) return;
        list.splice(index, 1);
        if (list.index === 0) {
          this.el.removeEventListener(this.namespace + event, this.checkEvent, false);
        }
      }
      checkEvent(event) {
        const name = event.type.replace(this.namespace, '');
        const list = this.listeners[name];
        if (!list || list.length === 0) return;
        list.forEach(func => {
          switch (name) {
            case 'scroll':
              return func(this.instance);
            case 'call':
              return func(this.callValue, this.callWay, this.callObj);
            default:
              return func();
          }
        });
      }
      startScroll() {
        this.stop = false;
      }
      stopScroll() {
        this.stop = true;
      }
      setScroll(x, y) {
        this.instance.scroll = {
          x: 0,
          y: 0
        };
      }
      destroy() {
        window.removeEventListener('resize', this.checkResize, false);
        Object.keys(this.listeners).forEach(event => {
          this.el.removeEventListener(this.namespace + event, this.checkEvent, false);
        });
        this.listeners = {};
        this.scrollToEls.forEach(el => {
          el.removeEventListener('click', this.setScrollTo, false);
        });
        this.html.classList.remove(this.initClass);
      }
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var smoothscroll = createCommonjsModule(function (module, exports) {
    /* smoothscroll v0.4.4 - 2019 - Dustan Kasten, Jeremias Menichelli - MIT License */
    (function () {

      // polyfill
      function polyfill() {
        // aliases
        var w = window;
        var d = document;

        // return if scroll behavior is supported and polyfill is not forced
        if (
          'scrollBehavior' in d.documentElement.style &&
          w.__forceSmoothScrollPolyfill__ !== true
        ) {
          return;
        }

        // globals
        var Element = w.HTMLElement || w.Element;
        var SCROLL_TIME = 468;

        // object gathering original scroll methods
        var original = {
          scroll: w.scroll || w.scrollTo,
          scrollBy: w.scrollBy,
          elementScroll: Element.prototype.scroll || scrollElement,
          scrollIntoView: Element.prototype.scrollIntoView
        };

        // define timing method
        var now =
          w.performance && w.performance.now
            ? w.performance.now.bind(w.performance)
            : Date.now;

        /**
         * indicates if a the current browser is made by Microsoft
         * @method isMicrosoftBrowser
         * @param {String} userAgent
         * @returns {Boolean}
         */
        function isMicrosoftBrowser(userAgent) {
          var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

          return new RegExp(userAgentPatterns.join('|')).test(userAgent);
        }

        /*
         * IE has rounding bug rounding down clientHeight and clientWidth and
         * rounding up scrollHeight and scrollWidth causing false positives
         * on hasScrollableSpace
         */
        var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

        /**
         * changes scroll position inside an element
         * @method scrollElement
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */
        function scrollElement(x, y) {
          this.scrollLeft = x;
          this.scrollTop = y;
        }

        /**
         * returns result of applying ease math function to a number
         * @method ease
         * @param {Number} k
         * @returns {Number}
         */
        function ease(k) {
          return 0.5 * (1 - Math.cos(Math.PI * k));
        }

        /**
         * indicates if a smooth behavior should be applied
         * @method shouldBailOut
         * @param {Number|Object} firstArg
         * @returns {Boolean}
         */
        function shouldBailOut(firstArg) {
          if (
            firstArg === null ||
            typeof firstArg !== 'object' ||
            firstArg.behavior === undefined ||
            firstArg.behavior === 'auto' ||
            firstArg.behavior === 'instant'
          ) {
            // first argument is not an object/null
            // or behavior is auto, instant or undefined
            return true;
          }

          if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
            // first argument is an object and behavior is smooth
            return false;
          }

          // throw error when behavior is not supported
          throw new TypeError(
            'behavior member of ScrollOptions ' +
              firstArg.behavior +
              ' is not a valid value for enumeration ScrollBehavior.'
          );
        }

        /**
         * indicates if an element has scrollable space in the provided axis
         * @method hasScrollableSpace
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function hasScrollableSpace(el, axis) {
          if (axis === 'Y') {
            return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
          }

          if (axis === 'X') {
            return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
          }
        }

        /**
         * indicates if an element has a scrollable overflow property in the axis
         * @method canOverflow
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function canOverflow(el, axis) {
          var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

          return overflowValue === 'auto' || overflowValue === 'scroll';
        }

        /**
         * indicates if an element can be scrolled in either axis
         * @method isScrollable
         * @param {Node} el
         * @param {String} axis
         * @returns {Boolean}
         */
        function isScrollable(el) {
          var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
          var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

          return isScrollableY || isScrollableX;
        }

        /**
         * finds scrollable parent of an element
         * @method findScrollableParent
         * @param {Node} el
         * @returns {Node} el
         */
        function findScrollableParent(el) {
          while (el !== d.body && isScrollable(el) === false) {
            el = el.parentNode || el.host;
          }

          return el;
        }

        /**
         * self invoked function that, given a context, steps through scrolling
         * @method step
         * @param {Object} context
         * @returns {undefined}
         */
        function step(context) {
          var time = now();
          var value;
          var currentX;
          var currentY;
          var elapsed = (time - context.startTime) / SCROLL_TIME;

          // avoid elapsed times higher than one
          elapsed = elapsed > 1 ? 1 : elapsed;

          // apply easing to elapsed time
          value = ease(elapsed);

          currentX = context.startX + (context.x - context.startX) * value;
          currentY = context.startY + (context.y - context.startY) * value;

          context.method.call(context.scrollable, currentX, currentY);

          // scroll more if we have not reached our destination
          if (currentX !== context.x || currentY !== context.y) {
            w.requestAnimationFrame(step.bind(w, context));
          }
        }

        /**
         * scrolls window or element with a smooth behavior
         * @method smoothScroll
         * @param {Object|Node} el
         * @param {Number} x
         * @param {Number} y
         * @returns {undefined}
         */
        function smoothScroll(el, x, y) {
          var scrollable;
          var startX;
          var startY;
          var method;
          var startTime = now();

          // define scroll context
          if (el === d.body) {
            scrollable = w;
            startX = w.scrollX || w.pageXOffset;
            startY = w.scrollY || w.pageYOffset;
            method = original.scroll;
          } else {
            scrollable = el;
            startX = el.scrollLeft;
            startY = el.scrollTop;
            method = scrollElement;
          }

          // scroll looping over a frame
          step({
            scrollable: scrollable,
            method: method,
            startTime: startTime,
            startX: startX,
            startY: startY,
            x: x,
            y: y
          });
        }

        // ORIGINAL METHODS OVERRIDES
        // w.scroll and w.scrollTo
        w.scroll = w.scrollTo = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.scroll.call(
              w,
              arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object'
                  ? arguments[0]
                  : w.scrollX || w.pageXOffset,
              // use top prop, second argument if present or fallback to scrollY
              arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined
                  ? arguments[1]
                  : w.scrollY || w.pageYOffset
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            w,
            d.body,
            arguments[0].left !== undefined
              ? ~~arguments[0].left
              : w.scrollX || w.pageXOffset,
            arguments[0].top !== undefined
              ? ~~arguments[0].top
              : w.scrollY || w.pageYOffset
          );
        };

        // w.scrollBy
        w.scrollBy = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0])) {
            original.scrollBy.call(
              w,
              arguments[0].left !== undefined
                ? arguments[0].left
                : typeof arguments[0] !== 'object' ? arguments[0] : 0,
              arguments[0].top !== undefined
                ? arguments[0].top
                : arguments[1] !== undefined ? arguments[1] : 0
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            w,
            d.body,
            ~~arguments[0].left + (w.scrollX || w.pageXOffset),
            ~~arguments[0].top + (w.scrollY || w.pageYOffset)
          );
        };

        // Element.prototype.scroll and Element.prototype.scrollTo
        Element.prototype.scroll = Element.prototype.scrollTo = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            // if one number is passed, throw error to match Firefox implementation
            if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
              throw new SyntaxError('Value could not be converted');
            }

            original.elementScroll.call(
              this,
              // use left prop, first number argument or fallback to scrollLeft
              arguments[0].left !== undefined
                ? ~~arguments[0].left
                : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,
              // use top prop, second argument or fallback to scrollTop
              arguments[0].top !== undefined
                ? ~~arguments[0].top
                : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
            );

            return;
          }

          var left = arguments[0].left;
          var top = arguments[0].top;

          // LET THE SMOOTHNESS BEGIN!
          smoothScroll.call(
            this,
            this,
            typeof left === 'undefined' ? this.scrollLeft : ~~left,
            typeof top === 'undefined' ? this.scrollTop : ~~top
          );
        };

        // Element.prototype.scrollBy
        Element.prototype.scrollBy = function() {
          // avoid action when no arguments are passed
          if (arguments[0] === undefined) {
            return;
          }

          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.elementScroll.call(
              this,
              arguments[0].left !== undefined
                ? ~~arguments[0].left + this.scrollLeft
                : ~~arguments[0] + this.scrollLeft,
              arguments[0].top !== undefined
                ? ~~arguments[0].top + this.scrollTop
                : ~~arguments[1] + this.scrollTop
            );

            return;
          }

          this.scroll({
            left: ~~arguments[0].left + this.scrollLeft,
            top: ~~arguments[0].top + this.scrollTop,
            behavior: arguments[0].behavior
          });
        };

        // Element.prototype.scrollIntoView
        Element.prototype.scrollIntoView = function() {
          // avoid smooth behavior if not required
          if (shouldBailOut(arguments[0]) === true) {
            original.scrollIntoView.call(
              this,
              arguments[0] === undefined ? true : arguments[0]
            );

            return;
          }

          // LET THE SMOOTHNESS BEGIN!
          var scrollableParent = findScrollableParent(this);
          var parentRects = scrollableParent.getBoundingClientRect();
          var clientRects = this.getBoundingClientRect();

          if (scrollableParent !== d.body) {
            // reveal element inside parent
            smoothScroll.call(
              this,
              scrollableParent,
              scrollableParent.scrollLeft + clientRects.left - parentRects.left,
              scrollableParent.scrollTop + clientRects.top - parentRects.top
            );

            // reveal parent in viewport unless is fixed
            if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
              w.scrollBy({
                left: parentRects.left,
                top: parentRects.top,
                behavior: 'smooth'
              });
            }
          } else {
            // reveal element in viewport
            w.scrollBy({
              left: clientRects.left,
              top: clientRects.top,
              behavior: 'smooth'
            });
          }
        };
      }

      {
        // commonjs
        module.exports = { polyfill: polyfill };
      }

    }());
    });
    smoothscroll.polyfill;

    function getTranslate(el) {
      const translate = {};
      if (!window.getComputedStyle) return;
      const style = getComputedStyle(el);
      const transform = style.transform || style.webkitTransform || style.mozTransform;
      let mat = transform.match(/^matrix3d\((.+)\)$/);
      if (mat) {
        translate.x = mat ? parseFloat(mat[1].split(', ')[12]) : 0;
        translate.y = mat ? parseFloat(mat[1].split(', ')[13]) : 0;
      } else {
        mat = transform.match(/^matrix\((.+)\)$/);
        translate.x = mat ? parseFloat(mat[1].split(', ')[4]) : 0;
        translate.y = mat ? parseFloat(mat[1].split(', ')[5]) : 0;
      }
      return translate;
    }

    function lerp(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }

    function t(t,e){for(var i=0;i<e.length;i++){var o=e[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,"symbol"==typeof(n=function(t,e){if("object"!=typeof t||null===t)return t;var i=t[Symbol.toPrimitive];if(void 0!==i){var o=i.call(t,"string");if("object"!=typeof o)return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(o.key))?n:String(n),o);}var n;}function e(e,i,o){return i&&t(e.prototype,i),o&&t(e,o),Object.defineProperty(e,"prototype",{writable:!1}),e}function i(){return i=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)Object.prototype.hasOwnProperty.call(i,o)&&(t[o]=i[o]);}return t},i.apply(this,arguments)}function o(t,e,i){return Math.max(t,Math.min(e,i))}var n=/*#__PURE__*/function(){function t(){}var e=t.prototype;return e.advance=function(t){var e;if(this.isRunning){var i,n=!1;if(this.lerp)this.value=(1-(i=this.lerp))*this.value+i*this.to,Math.round(this.value)===this.to&&(this.value=this.to,n=!0);else {this.currentTime+=t;var s=o(0,this.currentTime/this.duration,1),r=(n=s>=1)?1:this.easing(s);this.value=this.from+(this.to-this.from)*r;}null==(e=this.onUpdate)||e.call(this,this.value,{completed:n}),n&&this.stop();}},e.stop=function(){this.isRunning=!1;},e.fromTo=function(t,e,i){var o=i.lerp,n=void 0===o?.1:o,s=i.duration,r=void 0===s?1:s,l=i.easing,h=void 0===l?function(t){return t}:l,a=i.onUpdate;this.from=this.value=t,this.to=e,this.lerp=n,this.duration=r,this.easing=h,this.currentTime=0,this.isRunning=!0,this.onUpdate=a;},t}();function s(t,e){var i;return function(){var o=arguments,n=this;clearTimeout(i),i=setTimeout(function(){t.apply(n,o);},e);}}var r=/*#__PURE__*/function(){function t(t,e){var i=this;this.onWindowResize=function(){i.width=window.innerWidth,i.height=window.innerHeight;},this.onWrapperResize=function(){i.width=i.wrapper.clientWidth,i.height=i.wrapper.clientHeight;},this.onContentResize=function(){var t=i.wrapper===window?document.documentElement:i.wrapper;i.scrollHeight=t.scrollHeight,i.scrollWidth=t.scrollWidth;},this.wrapper=t,this.content=e,this.wrapper===window?(window.addEventListener("resize",this.onWindowResize,!1),this.onWindowResize()):(this.wrapperResizeObserver=new ResizeObserver(s(this.onWrapperResize,100)),this.wrapperResizeObserver.observe(this.wrapper),this.onWrapperResize()),this.contentResizeObserver=new ResizeObserver(s(this.onContentResize,100)),this.contentResizeObserver.observe(this.content),this.onContentResize();}return t.prototype.destroy=function(){var t,e;window.removeEventListener("resize",this.onWindowResize,!1),null==(t=this.wrapperResizeObserver)||t.disconnect(),null==(e=this.contentResizeObserver)||e.disconnect();},e(t,[{key:"limit",get:function(){return {x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}}]),t}(),l=/*#__PURE__*/function(){function t(t,e){var i=this,n=e.wheelMultiplier,s=void 0===n?1:n,r=e.touchMultiplier,l=void 0===r?2:r,h=e.normalizeWheel,a=void 0!==h&&h;this.onTouchStart=function(t){var e=t.targetTouches?t.targetTouches[0]:t,o=e.clientY;i.touchStart.x=e.clientX,i.touchStart.y=o,i.lastDelta={x:0,y:0};},this.onTouchMove=function(t){var e=t.targetTouches?t.targetTouches[0]:t,o=e.clientX,n=e.clientY,s=-(o-i.touchStart.x)*i.touchMultiplier,r=-(n-i.touchStart.y)*i.touchMultiplier;i.touchStart.x=o,i.touchStart.y=n,i.lastDelta={x:s,y:r},i.emitter.emit("scroll",{type:"touch",deltaX:s,deltaY:r,event:t});},this.onTouchEnd=function(t){i.emitter.emit("scroll",{type:"touch",inertia:!0,deltaX:i.lastDelta.x,deltaY:i.lastDelta.y,event:t});},this.onWheel=function(t){var e=t.deltaX,n=t.deltaY;i.normalizeWheel&&(e=o(-100,e,100),n=o(-100,n,100)),i.emitter.emit("scroll",{type:"wheel",deltaX:e*=i.wheelMultiplier,deltaY:n*=i.wheelMultiplier,event:t});},this.element=t,this.wheelMultiplier=s,this.touchMultiplier=l,this.normalizeWheel=a,this.touchStart={x:null,y:null},this.emitter={events:{},emit:function(t){for(var e=this.events[t]||[],i=0,o=e.length;i<o;i++)e[i].apply(e,[].slice.call(arguments,1));},on:function(t,e){var i,o=this;return (null==(i=this.events[t])?void 0:i.push(e))||(this.events[t]=[e]),function(){var i;o.events[t]=null==(i=o.events[t])?void 0:i.filter(function(t){return e!==t});}}},this.element.addEventListener("wheel",this.onWheel,{passive:!1}),this.element.addEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.addEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.addEventListener("touchend",this.onTouchEnd,{passive:!1});}var e=t.prototype;return e.on=function(t,e){return this.emitter.on(t,e)},e.destroy=function(){this.emitter.events={},this.element.removeEventListener("wheel",this.onWheel,{passive:!1}),this.element.removeEventListener("touchstart",this.onTouchStart,{passive:!1}),this.element.removeEventListener("touchmove",this.onTouchMove,{passive:!1}),this.element.removeEventListener("touchend",this.onTouchEnd,{passive:!1});},t}(),h=/*#__PURE__*/function(){function t(t){var e=this,o=void 0===t?{}:t,s=o.direction,h=o.gestureDirection,a=o.mouseMultiplier,c=o.smooth,u=o.wrapper,p=void 0===u?window:u,d=o.content,v=void 0===d?document.documentElement:d,m=o.wheelEventsTarget,f=void 0===m?p:m,g=o.smoothWheel,w=void 0===g?null==c||c:g,S=o.smoothTouch,y=void 0!==S&&S,T=o.syncTouch,z=void 0!==T&&T,b=o.syncTouchLerp,M=void 0===b?.1:b,E=o.touchInertiaMultiplier,L=void 0===E?35:E,W=o.duration,R=o.easing,O=void 0===R?function(t){return Math.min(1,1.001-Math.pow(2,-10*t))}:R,_=o.lerp,k=void 0===_?W?null:.1:_,x=o.infinite,H=void 0!==x&&x,D=o.orientation,j=void 0===D?null!=s?s:"vertical":D,X=o.gestureOrientation,Y=void 0===X?null!=h?h:"vertical":X,C=o.touchMultiplier,P=void 0===C?1:C,U=o.wheelMultiplier,A=void 0===U?null!=a?a:1:U,I=o.normalizeWheel,V=void 0!==I&&I;this.onVirtualScroll=function(t){var o=t.type,n=t.inertia,s=t.deltaX,r=t.deltaY,l=t.event;if(!l.ctrlKey){var h="touch"===o,a="wheel"===o;if(!("vertical"===e.options.gestureOrientation&&0===r||"horizontal"===e.options.gestureOrientation&&0===s||h&&"vertical"===e.options.gestureOrientation&&0===e.scroll&&!e.options.infinite&&r<=0||l.composedPath().find(function(t){return null==t||null==t.hasAttribute?void 0:t.hasAttribute("data-lenis-prevent")})))if(e.isStopped||e.isLocked)l.preventDefault();else {if(e.isSmooth=(e.options.smoothTouch||e.options.syncTouch)&&h||e.options.smoothWheel&&a,!e.isSmooth)return e.isScrolling=!1,void e.animate.stop();l.preventDefault();var c=r;"both"===e.options.gestureOrientation?c=Math.abs(r)>Math.abs(s)?r:s:"horizontal"===e.options.gestureOrientation&&(c=s);var u=h&&e.options.syncTouch,p=h&&n&&Math.abs(c)>1;p&&(c=e.velocity*e.options.touchInertiaMultiplier),e.scrollTo(e.targetScroll+c,i({programmatic:!1},u&&{lerp:p?e.syncTouchLerp:.4}));}}},this.onScroll=function(){if(!e.isScrolling){var t=e.animatedScroll;e.animatedScroll=e.targetScroll=e.actualScroll,e.velocity=0,e.direction=Math.sign(e.animatedScroll-t),e.emit();}},s&&console.warn("Lenis: `direction` option is deprecated, use `orientation` instead"),h&&console.warn("Lenis: `gestureDirection` option is deprecated, use `gestureOrientation` instead"),a&&console.warn("Lenis: `mouseMultiplier` option is deprecated, use `wheelMultiplier` instead"),c&&console.warn("Lenis: `smooth` option is deprecated, use `smoothWheel` instead"),window.lenisVersion="1.0.10",p!==document.documentElement&&p!==document.body||(p=window),this.options={wrapper:p,content:v,wheelEventsTarget:f,smoothWheel:w,smoothTouch:y,syncTouch:z,syncTouchLerp:M,touchInertiaMultiplier:L,duration:W,easing:O,lerp:k,infinite:H,gestureOrientation:Y,orientation:j,touchMultiplier:P,wheelMultiplier:A,normalizeWheel:V},this.dimensions=new r(p,v),this.rootElement.classList.add("lenis"),this.velocity=0,this.isStopped=!1,this.isSmooth=w||y,this.isScrolling=!1,this.targetScroll=this.animatedScroll=this.actualScroll,this.animate=new n,this.emitter={events:{},emit:function(t){for(var e=this.events[t]||[],i=0,o=e.length;i<o;i++)e[i].apply(e,[].slice.call(arguments,1));},on:function(t,e){var i,o=this;return (null==(i=this.events[t])?void 0:i.push(e))||(this.events[t]=[e]),function(){var i;o.events[t]=null==(i=o.events[t])?void 0:i.filter(function(t){return e!==t});}}},this.options.wrapper.addEventListener("scroll",this.onScroll,{passive:!1}),this.virtualScroll=new l(f,{touchMultiplier:P,wheelMultiplier:A,normalizeWheel:V}),this.virtualScroll.on("scroll",this.onVirtualScroll);}var s=t.prototype;return s.destroy=function(){this.emitter.events={},this.options.wrapper.removeEventListener("scroll",this.onScroll,{passive:!1}),this.virtualScroll.destroy();},s.on=function(t,e){return this.emitter.on(t,e)},s.off=function(t,e){var i;this.emitter.events[t]=null==(i=this.emitter.events[t])?void 0:i.filter(function(t){return e!==t});},s.setScroll=function(t){this.isHorizontal?this.rootElement.scrollLeft=t:this.rootElement.scrollTop=t;},s.emit=function(){this.emitter.emit("scroll",this);},s.reset=function(){this.isLocked=!1,this.isScrolling=!1,this.velocity=0,this.animate.stop();},s.start=function(){this.isStopped=!1,this.reset();},s.stop=function(){this.isStopped=!0,this.animate.stop(),this.reset();},s.raf=function(t){var e=t-(this.time||t);this.time=t,this.animate.advance(.001*e);},s.scrollTo=function(t,e){var i=this,n=void 0===e?{}:e,s=n.offset,r=void 0===s?0:s,l=n.immediate,h=void 0!==l&&l,a=n.lock,c=void 0!==a&&a,u=n.duration,p=void 0===u?this.options.duration:u,d=n.easing,v=void 0===d?this.options.easing:d,m=n.lerp,f=void 0===m?!p&&this.options.lerp:m,g=n.onComplete,w=void 0===g?null:g,S=n.force,y=n.programmatic,T=void 0===y||y;if(!this.isStopped||void 0!==S&&S){if(["top","left","start"].includes(t))t=0;else if(["bottom","right","end"].includes(t))t=this.limit;else {var z,b;if("string"==typeof t?b=document.querySelector(t):null!=(z=t)&&z.nodeType&&(b=t),b){if(this.options.wrapper!==window){var M=this.options.wrapper.getBoundingClientRect();r-=this.isHorizontal?M.left:M.top;}var E=b.getBoundingClientRect();t=(this.isHorizontal?E.left:E.top)+this.animatedScroll;}}if("number"==typeof t){if(t+=r,this.options.infinite?T&&(this.targetScroll=this.animatedScroll=this.scroll):t=o(0,t,this.limit),h)return this.animatedScroll=this.targetScroll=t,this.setScroll(this.scroll),this.reset(),this.emit(),void(null==w||w());if(!T){if(t===this.targetScroll)return;this.targetScroll=t;}this.animate.fromTo(this.animatedScroll,t,{duration:p,easing:v,lerp:f,onUpdate:function(t,e){var o=e.completed;c&&(i.isLocked=!0),i.isScrolling=!0,i.velocity=t-i.animatedScroll,i.direction=Math.sign(i.velocity),i.animatedScroll=t,i.setScroll(i.scroll),T&&(i.targetScroll=t),o&&(c&&(i.isLocked=!1),requestAnimationFrame(function(){i.isScrolling=!1;}),i.velocity=0,null==w||w()),i.emit();}});}}},e(t,[{key:"rootElement",get:function(){return this.options.wrapper===window?this.options.content:this.options.wrapper}},{key:"limit",get:function(){return this.isHorizontal?this.dimensions.limit.x:this.dimensions.limit.y}},{key:"isHorizontal",get:function(){return "horizontal"===this.options.orientation}},{key:"actualScroll",get:function(){return this.isHorizontal?this.rootElement.scrollLeft:this.rootElement.scrollTop}},{key:"scroll",get:function(){return this.options.infinite?(e=this.animatedScroll%(t=this.limit),(t>0&&e<0||t<0&&e>0)&&(e+=t),e):this.animatedScroll;var t,e;}},{key:"progress",get:function(){return 0===this.limit?1:this.scroll/this.limit}},{key:"isSmooth",get:function(){return this.__isSmooth},set:function(t){this.__isSmooth!==t&&(this.rootElement.classList.toggle("lenis-smooth",t),this.__isSmooth=t);}},{key:"isScrolling",get:function(){return this.__isScrolling},set:function(t){this.__isScrolling!==t&&(this.rootElement.classList.toggle("lenis-scrolling",t),this.__isScrolling=t);}},{key:"isStopped",get:function(){return this.__isStopped},set:function(t){this.__isStopped!==t&&(this.rootElement.classList.toggle("lenis-stopped",t),this.__isStopped=t);}}]),t}();

    class Scroll extends Core {
      constructor() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        super(options);
        if (this.resetNativeScroll) {
          if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
          }
          window.scrollTo(0, 0);
        }
        if (window.smoothscrollPolyfill === undefined) {
          window.smoothscrollPolyfill = smoothscroll;
          window.smoothscrollPolyfill.polyfill();
        }
      }
      init() {
        if (this.smooth) {
          this.html.classList.add(this.smoothClass);
          this.html.setAttribute(`data-${this.name}-direction`, this.direction);
        }
        this.addElements();
        this.detectElements();
        this.transformElements(true, true);
        this.initContainerSize();
        this.lenis = new h({
          wrapper: this.wrapper,
          content: this.el,
          duration: this.duration,
          easing: this.easing,
          direction: this.direction,
          gestureDirection: this.gestureDirection,
          smooth: this.smooth,
          smoothTouch: this.smooth,
          touchMultiplier: this.touchMultiplier
        });
        this.bindOnScroll = this.onScroll.bind(this);
        this.lenis.on('scroll', this.bindOnScroll);

        //get scroll value
        this.lenis.on('scroll', _ref => {
        } // console.log({ scroll, limit, velocity, direction, progress });
        // console.log(this.lenis);
        );

        this.raf(0);
        super.init();
      }
      raf(time) {
        this.lenis.raf(time);
        this.rafInstance = requestAnimationFrame(() => this.raf(Date.now()));
      }
      onScroll(_ref2) {
        let {
          scroll,
          velocity
        } = _ref2;
        if (scroll > this.instance.scroll[this.directionAxis]) {
          if (this.instance.direction !== 'down') {
            this.instance.direction = 'down';
          }
        } else if (scroll < this.instance.scroll[this.directionAxis]) {
          if (this.instance.direction !== 'up') {
            this.instance.direction = 'up';
          }
        }
        this.instance.scroll[this.directionAxis] = scroll;
        this.instance.speed = velocity;
        if (Object.entries(this.els).length) {
          if (!this.hasScrollTicking) {
            requestAnimationFrame(() => {
              this.detectElements();
            });
            this.hasScrollTicking = true;
          }
        }
        super.onScroll();
        this.transformElements();
      }
      resize() {
        this.windowHeight = window.innerHeight;
        this.windowWidth = window.innerWidth;
        this.windowMiddle = {
          x: this.windowWidth / 2,
          y: this.windowHeight / 2
        };
        this.checkContext();
        this.initContainerSize();
        if (Object.entries(this.els).length) {
          this.update();
        }
      }
      initContainerSize() {
        if (this.direction === 'horizontal') {
          let elWidth = 0;
          for (let childIndex = 0; childIndex < this.el.children.length; childIndex++) {
            const child = this.el.children[childIndex];
            elWidth += child.getBoundingClientRect().width;
          }
          this.el.style.setProperty('--scrollContainerWidth', elWidth + 'px');
        }
      }
      addElements() {
        this.els = {};
        this.parallaxElements = {};
        const els = this.el.querySelectorAll('[data-' + this.name + ']');
        els.forEach((el, index) => {
          el.getBoundingClientRect();
          let cl = el.dataset[this.name + 'Class'] || this.class;
          let id = typeof el.dataset[this.name + 'Id'] === 'string' ? el.dataset[this.name + 'Id'] : index;
          let top;
          let left;
          let offset = typeof el.dataset[this.name + 'Offset'] === 'string' ? el.dataset[this.name + 'Offset'].split(',') : this.offset;
          let repeat = el.dataset[this.name + 'Repeat'];
          let call = el.dataset[this.name + 'Call'];
          let position = el.dataset[this.name + 'Position'];
          let delay = el.dataset[this.name + 'Delay'];
          let direction = el.dataset[this.name + 'Direction'];
          let sticky = typeof el.dataset[this.name + 'Sticky'] === 'string';
          if (sticky) {
            console.warn("You use data-scroll-sticky, it's not recommended for performances. Please adapt your code and play with position:sticky.");
          }
          let target = el.dataset[this.name + 'Target'];
          let targetEl;
          if (target !== undefined) {
            targetEl = document.querySelector(`${target}`);
          } else {
            targetEl = el;
          }
          const targetElBCR = targetEl.getBoundingClientRect();
          top = targetElBCR.top + this.instance.scroll.y - getTranslate(targetEl).y;
          left = targetElBCR.left + this.instance.scroll.x - getTranslate(targetEl).x;
          let bottom = top + targetEl.offsetHeight;
          let right = left + targetEl.offsetWidth;
          let middle = {
            x: (right - left) / 2 + left,
            y: (bottom - top) / 2 + top
          };
          if (sticky) {
            const elBCR = el.getBoundingClientRect();
            const elTop = elBCR.top;
            const elLeft = elBCR.left;
            const elDistance = {
              x: elLeft - left,
              y: elTop - top
            };
            top += window.innerHeight;
            left += window.innerWidth;
            bottom = elTop + targetEl.offsetHeight - el.offsetHeight - elDistance[this.directionAxis];
            right = elLeft + targetEl.offsetWidth - el.offsetWidth - elDistance[this.directionAxis];
            middle = {
              x: (right - left) / 2 + left,
              y: (bottom - top) / 2 + top
            };
          }
          if (repeat == 'false') {
            repeat = false;
          } else if (repeat != undefined) {
            repeat = true;
          } else {
            repeat = this.repeat;
          }
          let speed = el.dataset[this.name + 'Speed'] ? parseFloat(el.dataset[this.name + 'Speed']) / 10 : false;
          if (speed) {
            offset = 0;
          }
          let relativeOffset = [0, 0];
          if (offset) {
            if (this.direction === 'horizontal') {
              for (var i = 0; i < offset.length; i++) {
                if (typeof offset[i] == 'string') {
                  if (offset[i].includes('%')) {
                    relativeOffset[i] = parseInt(offset[i].replace('%', '') * this.windowWidth / 100);
                  } else {
                    relativeOffset[i] = parseInt(offset[i]);
                  }
                } else {
                  relativeOffset[i] = offset[i];
                }
              }
              left = left + relativeOffset[0];
              right = right - relativeOffset[1];
            } else {
              for (var i = 0; i < offset.length; i++) {
                if (typeof offset[i] == 'string') {
                  if (offset[i].includes('%')) {
                    relativeOffset[i] = parseInt(offset[i].replace('%', '') * this.windowHeight / 100);
                  } else {
                    relativeOffset[i] = parseInt(offset[i]);
                  }
                } else {
                  relativeOffset[i] = offset[i];
                }
              }
              top = top + relativeOffset[0];
              bottom = bottom - relativeOffset[1];
            }
          }
          const mappedEl = {
            el: el,
            targetEl: targetEl,
            id,
            class: cl,
            top: top,
            bottom: bottom,
            middle,
            left,
            right,
            position,
            delay,
            direction,
            offset,
            progress: 0,
            repeat,
            inView: false,
            call,
            speed,
            sticky
          };
          this.els[id] = mappedEl;
          if (el.classList.contains(cl)) {
            this.setInView(this.els[id], id);
          }
          if (speed !== false || sticky) {
            this.parallaxElements[id] = mappedEl;
          }
        });
      }
      updateElements() {
        Object.entries(this.els).forEach(_ref3 => {
          let [i, el] = _ref3;
          const top = el.targetEl.getBoundingClientRect().top + this.instance.scroll.y;
          const bottom = top + el.targetEl.offsetHeight;
          const relativeOffset = this.getRelativeOffset(el.offset);
          this.els[i].top = top + relativeOffset[0];
          this.els[i].bottom = bottom - relativeOffset[1];
        });
        this.hasScrollTicking = false;
      }
      transform(element, x, y, delay) {
        let transform;
        if (!delay) {
          transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${x},${y},0,1)`;
        } else {
          let start = getTranslate(element);
          let lerpX = lerp(start.x, x, delay);
          let lerpY = lerp(start.y, y, delay);
          transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${lerpX},${lerpY},0,1)`;
        }
        element.style.webkitTransform = transform;
        element.style.msTransform = transform;
        element.style.transform = transform;
      }
      transformElements(isForced) {
        let setAllElements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        if (!this.smooth) return;
        const scrollRight = this.instance.scroll.x + this.windowWidth;
        const scrollBottom = this.instance.scroll.y + this.windowHeight;
        const scrollMiddle = {
          x: this.instance.scroll.x + this.windowMiddle.x,
          y: this.instance.scroll.y + this.windowMiddle.y
        };
        Object.entries(this.parallaxElements).forEach(_ref4 => {
          let [i, current] = _ref4;
          let transformDistance = false;
          if (isForced) {
            transformDistance = 0;
          }
          if (current.inView || setAllElements) {
            switch (current.position) {
              case 'top':
                transformDistance = this.instance.scroll[this.directionAxis] * -current.speed;
                break;
              case 'elementTop':
                transformDistance = (scrollBottom - current.top) * -current.speed;
                break;
              case 'bottom':
                transformDistance = (this.instance.limit[this.directionAxis] - scrollBottom + this.windowHeight) * current.speed;
                break;
              case 'left':
                transformDistance = this.instance.scroll[this.directionAxis] * -current.speed;
                break;
              case 'elementLeft':
                transformDistance = (scrollRight - current.left) * -current.speed;
                break;
              case 'right':
                transformDistance = (this.instance.limit[this.directionAxis] - scrollRight + this.windowHeight) * current.speed;
                break;
              default:
                transformDistance = (scrollMiddle[this.directionAxis] - current.middle[this.directionAxis]) * -current.speed;
                break;
            }
          }
          if (current.sticky) {
            if (current.inView) {
              if (this.direction === 'horizontal') {
                transformDistance = this.instance.scroll.x - current.left + this.windowWidth;
              } else {
                transformDistance = this.instance.scroll.y - current.top + this.windowHeight;
              }
            } else {
              if (this.direction === 'horizontal') {
                if (this.instance.scroll.x < current.left - this.windowWidth && this.instance.scroll.x < current.left - this.windowWidth / 2) {
                  transformDistance = 0;
                } else if (this.instance.scroll.x > current.right && this.instance.scroll.x > current.right + 100) {
                  transformDistance = current.right - current.left + this.windowWidth;
                } else {
                  transformDistance = false;
                }
              } else {
                if (this.instance.scroll.y < current.top - this.windowHeight && this.instance.scroll.y < current.top - this.windowHeight / 2) {
                  transformDistance = 0;
                } else if (this.instance.scroll.y > current.bottom && this.instance.scroll.y > current.bottom + 100) {
                  transformDistance = current.bottom - current.top + this.windowHeight;
                } else {
                  transformDistance = false;
                }
              }
            }
          }
          if (transformDistance !== false) {
            if (current.direction === 'horizontal' || this.direction === 'horizontal' && current.direction !== 'vertical') {
              this.transform(current.el, transformDistance, 0, isForced ? false : current.delay);
            } else {
              this.transform(current.el, 0, transformDistance, isForced ? false : current.delay);
            }
          }
        });
      }
      getRelativeOffset(offset) {
        let relativeOffset = [0, 0];
        if (offset) {
          for (var i = 0; i < offset.length; i++) {
            if (typeof offset[i] == 'string') {
              if (offset[i].includes('%')) {
                relativeOffset[i] = parseInt(offset[i].replace('%', '') * this.windowHeight / 100);
              } else {
                relativeOffset[i] = parseInt(offset[i]);
              }
            } else {
              relativeOffset[i] = offset[i];
            }
          }
        }
        return relativeOffset;
      }

      /**
       * Scroll to a desired target.
       *
       * @param  Available options :
       *          target - node, string, "top", "bottom", int - The DOM element we want to scroll to
       *          options {object} - Options object for additional settings.
       * @return {void}
       */
      scrollTo(target) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // Parse options
        let offset = parseInt(options.offset) || 0; // An offset to apply on top of given `target` or `sourceElem`'s target
        let duration = options.duration || 1;
        let easing = this.scrollToEasing;
        this.lenis.scrollTo(target, {
          offset,
          immediate: options.immediate,
          duration: duration,
          easing: easing
        });
      }
      update() {
        this.addElements();
        this.detectElements();
        this.transformElements(true);
      }
      startScroll() {
        if (this.lenis != undefined) {
          this.lenis.start();
        }
      }
      stopScroll() {
        if (this.lenis != undefined) {
          this.lenis.stop();
        }
      }
      destroy() {
        super.destroy();
        cancelAnimationFrame(this.rafInstance);
      }
    }

    class Main {
      constructor() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        this.options = options;

        // Override default options with given ones
        Object.assign(this, defaults, options);
        this.smartphone = defaults.smartphone;
        if (options.smartphone) Object.assign(this.smartphone, options.smartphone);
        this.tablet = defaults.tablet;
        if (options.tablet) Object.assign(this.tablet, options.tablet);
        if (!this.smooth && this.direction == 'horizontal') console.warn('🚨 `smooth:false` & `horizontal` direction are not yet compatible');
        if (!this.tablet.smooth && this.tablet.direction == 'horizontal') console.warn('🚨 `smooth:false` & `horizontal` direction are not yet compatible (tablet)');
        if (!this.smartphone.smooth && this.smartphone.direction == 'horizontal') console.warn('🚨 `smooth:false` & `horizontal` direction are not yet compatible (smartphone)');
        this.init();
      }
      init() {
        this.options.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 || window.innerWidth < this.tablet.breakpoint;
        this.options.isTablet = this.options.isMobile && window.innerWidth >= this.tablet.breakpoint;
        if (this.smooth && !this.options.isMobile || this.tablet.smooth && this.options.isTablet || this.smartphone.smooth && this.options.isMobile && !this.options.isTablet) {
          this.smooth = true;
        } else {
          this.smooth = false;
        }
        this.scroll = new Scroll(this.options);
        this.scroll.init();
        if (window.location.hash) {
          // Get the hash without the '#' and find the matching element
          const id = window.location.hash.slice(1, window.location.hash.length);
          let target = document.getElementById(id);

          // If found, scroll to the element
          if (target) this.scroll.scrollTo(target);
        }
      }
      update() {
        this.scroll.update();
      }
      start() {
        this.scroll.startScroll();
      }
      stop() {
        this.scroll.stopScroll();
      }
      scrollTo(target, options) {
        this.scroll.scrollTo(target, options);
      }
      setScroll(x, y) {
        this.scroll.setScroll(x, y);
      }
      on(event, func) {
        this.scroll.setEvents(event, func);
      }
      off(event, func) {
        this.scroll.unsetEvents(event, func);
      }
      destroy() {
        this.scroll.destroy();
      }
    }

    return Main;

}));
