import Core from './Core';
import smoothscroll from 'smoothscroll-polyfill';
import { getTranslate } from './utils/transform';
import { lerp } from './utils/maths';
import Lenis from '@studio-freight/lenis';

export default class extends Core {
    constructor(options = {}) {
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

        this.lenis = new Lenis({
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
        this.lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
            // console.log({ scroll, limit, velocity, direction, progress });
            // console.log(this.lenis);
        });

        this.raf(0);

        super.init();
    }

    raf(time) {
        this.lenis.raf(time);
        this.rafInstance = requestAnimationFrame(() => this.raf(Date.now()));
    }

    onScroll({ scroll, velocity }) {
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
            const BCR = el.getBoundingClientRect();
            let cl = el.dataset[this.name + 'Class'] || this.class;
            let id =
                typeof el.dataset[this.name + 'Id'] === 'string'
                    ? el.dataset[this.name + 'Id']
                    : index;
            let top;
            let left;
            let offset =
                typeof el.dataset[this.name + 'Offset'] === 'string'
                    ? el.dataset[this.name + 'Offset'].split(',')
                    : this.offset;
            let repeat = el.dataset[this.name + 'Repeat'];
            let call = el.dataset[this.name + 'Call'];
            let position = el.dataset[this.name + 'Position'];
            let delay = el.dataset[this.name + 'Delay'];
            let direction = el.dataset[this.name + 'Direction'];
            let sticky = typeof el.dataset[this.name + 'Sticky'] === 'string';

            if (sticky) {
                console.warn(
                    "You use data-scroll-sticky, it's not recommended for performances. Please adapt your code and play with position:sticky."
                );
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
                bottom =
                    elTop +
                    targetEl.offsetHeight -
                    el.offsetHeight -
                    elDistance[this.directionAxis];
                right =
                    elLeft + targetEl.offsetWidth - el.offsetWidth - elDistance[this.directionAxis];
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

            let speed = el.dataset[this.name + 'Speed']
                ? parseFloat(el.dataset[this.name + 'Speed']) / 10
                : false;

            if (speed) {
                offset = 0;
            }

            let relativeOffset = [0, 0];
            if (offset) {
                if (this.direction === 'horizontal') {
                    for (var i = 0; i < offset.length; i++) {
                        if (typeof offset[i] == 'string') {
                            if (offset[i].includes('%')) {
                                relativeOffset[i] = parseInt(
                                    (offset[i].replace('%', '') * this.windowWidth) / 100
                                );
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
                                relativeOffset[i] = parseInt(
                                    (offset[i].replace('%', '') * this.windowHeight) / 100
                                );
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
        Object.entries(this.els).forEach(([i, el]) => {
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

    transformElements(isForced, setAllElements = false) {
        if (!this.smooth) return;

        const scrollRight = this.instance.scroll.x + this.windowWidth;
        const scrollBottom = this.instance.scroll.y + this.windowHeight;

        const scrollMiddle = {
            x: this.instance.scroll.x + this.windowMiddle.x,
            y: this.instance.scroll.y + this.windowMiddle.y
        };

        Object.entries(this.parallaxElements).forEach(([i, current]) => {
            let transformDistance = false;

            if (isForced) {
                transformDistance = 0;
            }

            if (current.inView || setAllElements) {
                switch (current.position) {
                    case 'top':
                        transformDistance =
                            this.instance.scroll[this.directionAxis] * -current.speed;
                        break;

                    case 'elementTop':
                        transformDistance = (scrollBottom - current.top) * -current.speed;
                        break;

                    case 'bottom':
                        transformDistance =
                            (this.instance.limit[this.directionAxis] -
                                scrollBottom +
                                this.windowHeight) *
                            current.speed;
                        break;

                    case 'left':
                        transformDistance =
                            this.instance.scroll[this.directionAxis] * -current.speed;
                        break;

                    case 'elementLeft':
                        transformDistance = (scrollRight - current.left) * -current.speed;
                        break;

                    case 'right':
                        transformDistance =
                            (this.instance.limit[this.directionAxis] -
                                scrollRight +
                                this.windowHeight) *
                            current.speed;
                        break;

                    default:
                        transformDistance =
                            (scrollMiddle[this.directionAxis] -
                                current.middle[this.directionAxis]) *
                            -current.speed;
                        break;
                }
            }

            if (current.sticky) {
                if (current.inView) {
                    if (this.direction === 'horizontal') {
                        transformDistance =
                            this.instance.scroll.x - current.left + this.windowWidth;
                    } else {
                        transformDistance =
                            this.instance.scroll.y - current.top + this.windowHeight;
                    }
                } else {
                    if (this.direction === 'horizontal') {
                        if (
                            this.instance.scroll.x < current.left - this.windowWidth &&
                            this.instance.scroll.x < current.left - this.windowWidth / 2
                        ) {
                            transformDistance = 0;
                        } else if (
                            this.instance.scroll.x > current.right &&
                            this.instance.scroll.x > current.right + 100
                        ) {
                            transformDistance = current.right - current.left + this.windowWidth;
                        } else {
                            transformDistance = false;
                        }
                    } else {
                        if (
                            this.instance.scroll.y < current.top - this.windowHeight &&
                            this.instance.scroll.y < current.top - this.windowHeight / 2
                        ) {
                            transformDistance = 0;
                        } else if (
                            this.instance.scroll.y > current.bottom &&
                            this.instance.scroll.y > current.bottom + 100
                        ) {
                            transformDistance = current.bottom - current.top + this.windowHeight;
                        } else {
                            transformDistance = false;
                        }
                    }
                }
            }

            if (transformDistance !== false) {
                if (
                    current.direction === 'horizontal' ||
                    (this.direction === 'horizontal' && current.direction !== 'vertical')
                ) {
                    this.transform(
                        current.el,
                        transformDistance,
                        0,
                        isForced ? false : current.delay
                    );
                } else {
                    this.transform(
                        current.el,
                        0,
                        transformDistance,
                        isForced ? false : current.delay
                    );
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
                        relativeOffset[i] = parseInt(
                            (offset[i].replace('%', '') * this.windowHeight) / 100
                        );
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
    scrollTo(target, options = {}) {
        // Parse options
        let offset = parseInt(options.offset) || 0; // An offset to apply on top of given `target` or `sourceElem`'s target
        let duration = options.duration || 1;

        this.lenis.scrollTo(target, { offset, immediate: options.immediate, duration: duration });
    }

    update() {
        this.addElements();
        this.detectElements();
        this.transformElements(true);
    }

    destroy() {
        super.destroy();
        cancelAnimationFrame(this.rafInstance);
    }
}
