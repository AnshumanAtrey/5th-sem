// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * Simple shared animations for use in OSEP theme. (Note: This module is only
 * for simple, reusable animations. More specific animations are included in
 * their own modules.)
 *
 * @package theme_osep
 * @copyright 2019 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module theme_osep/animations
 */
define([], function() {
    /**
     * @alias module:theme_osep/animations
     */
    var t = {
        /**
         * Default animation time
         *
         * @public
         */
        DEFAULT_TIME : 0.4,
        /**
         * Half the default animation timetheme/osep/amd/src/blockhide.js
         *
         * @public
         */
        HALF_TIME : 0.2,

        /**
         * Default speed (pixels per second)
         *
         * @public
         */
        DEFAULT_SPEED : 1000,

        /**
         * Number of animations currently pending
         *
         * @private
         */
        pendingAnimations : 0,

        /**
         * Returns true if the browser supports transitions.
         *
         * @public
         * @returns {Boolean} True if browser supports transitions
         */
        supportsTransitions : function() {
            return 'transition' in document.body.style;
        },

        /**
         * Called internally when an animation starts. Must be paired with
         * animationFinished.
         *
         * @private
         */
        animationStarted : function() {
            t.pendingAnimations++;
            if (t.pendingAnimations === 1) {
                M.util.js_pending('theme_osep_animations');
            }
        },

        /**
         * Called internally when an animation finishes.
         *
         * @private
         */
        animationFinished : function() {
            t.pendingAnimations--;
            if (t.pendingAnimations === 0) {
                M.util.js_complete('theme_osep_animations');
            }
        },

        /**
         * Animates the opacity of an element.
         *
         * Available options:
         * - after (function to call when done)
         * - seconds (transition time); if not specified, it will use DEFAULT_TIME
         *
         * @param el Element to change opacity
         * @param opacity Opacity value
         * @param [options] Options
         */
        fade : function(el, opacity, options) {
            if (options === undefined) {
                options = {};
            }
            var seconds = t.DEFAULT_TIME;
            if (options.seconds) {
                seconds = options.seconds;
            }
            if (!t.supportsTransitions()) {
                el.css('opacity', opacity);
                if (options.after) {
                    options.after();
                }
                return;
            }

            var currentOpacity = el.css('opacity');
            if (currentOpacity == opacity) {
                if (options.after) {
                    options.after();
                }
                return;
            }

            t.animationStarted();

            // Set initial opacity value in case not specified.
            el.css('opacity', currentOpacity);
            el.css('transition', 'opacity ' + seconds + 's');
            setTimeout(function() {
                el.css('opacity', opacity);
            }, 0);
            el.one('transitionend', function() {
                if (options.after) {
                    options.after();
                }
                el.css('transition', '');
                t.animationFinished();
            });
        },

        /**
         * Fades in an element. The element should currently be set to
         * display:none.
         *
         * It is OK to call fadeIn before fadeOut finishes. If you call fadeIn
         * when already fading in, it will be ignored and any 'after' function
         * will not be called.
         *
         * If you specify an 'after' function then it will be called when
         * the transition completes. The function can have one parameter which
         * will be true if it completed normally or false if it completed early
         * because fadeOut was called.
         *
         * If you specify a 'display' value as 'inline' then the revealed
         * element will have this display type. Otherwise it will be a block.
         *
         * @public
         * @param el jQuery wrapped element
         * @param {number} [seconds] Length of transition
         * @param {Object} [options] Options (may include display, after)
         */
        fadeIn : function(el, seconds, options) {
            if (el.inFadeIn) {
                return;
            }
            if (seconds === undefined) {
                seconds = t.DEFAULT_TIME;
            }
            if (options === undefined) {
                options = { after: null, display: 'block' };
            }
            el.css('display', options.display);
            if (t.supportsTransitions()) {
                t.animationStarted();
                if (el.inFadeOut) {
                    if (el.inFadeAfter) {
                        el.inFadeAfter(false);
                        t.animationFinished();
                    }
                    delete el.inFadeOut;
                    el.css('opacity', 1);
                } else {
                    el.css('opacity', 0);
                    // For some reason this following line is necessary to make
                    // it actually update opacity to zero and do the transition.
                    el.css('opacity');
                    el.css('transition', 'opacity ' + seconds + 's');
                    el.one('transitionend', function() {
                        t.fadeEnd(el);
                    });
                    setTimeout(function() {
                        el.css('opacity', 1);
                    }, 0);
                }
                el.inFadeIn = true;
                el.inFadeAfter = options.after;
            } else {
                if (options.after) {
                    options.after(true);
                }
            }
        },

        /**
         * Fades out an element. The element should currently be set to
         * display:inline or block.
         *
         * It is OK to call fadeOut before fadeIn finishes. If you call fadeOut
         * when already fading out, it will be ignored and any 'after' function
         * will not be called.
         *
         * If you specify an 'after' function then it will be called when
         * the transition completes. The function can have one parameter which
         * will be true if it completed normally or false if it completed early
         * because fadeIn was called.
         *
         * You can specify 'noDisplayNone' to stop it being hidden at end of fade
         * (it will remain with opacity 0).
         *
         * @public
         * @param el jQuery wrapped element
         * @param {number} [seconds] Length of transition
         * @param {Object} [options] Options (may include after)
         */
        fadeOut : function(el, seconds, options) {
            if (el.inFadeOut) {
                return;
            }
            if (seconds === undefined) {
                seconds = t.DEFAULT_TIME;
            }
            if (options === undefined) {
                options = { after: null };
            }
            if (t.supportsTransitions()) {
                t.animationStarted();
                if (el.inFadeIn) {
                    if (el.inFadeAfter) {
                        el.inFadeAfter(false);
                        t.animationFinished();
                    }
                    delete el.inFadeIn;
                    el.css('opacity', 0);
                } else {
                    el.css('transition', 'opacity ' + seconds + 's');
                    setTimeout(function() {
                        el.css('opacity', 0);
                    });
                    el.one('transitionend', function() {
                        t.fadeEnd(el);
                    });
                }
                el.inFadeOut = true;
                el.inFadeAfter = options.after;
                if (options.noDisplayNone) {
                    el.inFadeAfterNoDisplayNone = true;
                }
            } else {
                el.css('display', 'none');
                if (options.after) {
                    options.after(true);
                }
            }
        },

        /**
         * Internal function used when fade transition ends.
         *
         * @private
         * @param el jQuery wrapped element
         */
        fadeEnd : function(el) {
            if (el.inFadeIn) {
                delete el.inFadeIn;
                el.css('transition', '');
            } else if (el.inFadeOut) {
                if (el.inFadeAfterNoDisplayNone) {
                    delete el.inFadeAfterNoDisplayNone;
                } else {
                    el.css('display', 'none');
                    el.css('opacity', '');
                }
                el.css('transition', '');
                delete el.inFadeOut;
            }
            t.animationFinished();
            if (el.inFadeAfter) {
                el.inFadeAfter(true);
            }
        },

        /**
         * Smoothly slides the 'left' and/or 'top' positions.
         *
         * Available options:
         * - after (function to call when slid)
         * - speed (transition speed)
         * - seconds (transition time); if not specified, it will use
         *   speed or DEFAULT_SPEED to calculate
         *
         * @param el Element to slide
         * @param {Object} target Target positions, may include 'left' and/or 'top' e.g { left: 123 }
         * @param {Object} [options] Options (may include after)
         */
        slidePosition : function(el, target, options) {
            if (options === undefined) {
                options = {};
            }
            if (!t.supportsTransitions) {
                el.css(target);
                if (options.after) {
                    options.after();
                }
                return;
            }

            // If it's already in the required position, stop.
            var unmoved = true;
            var existing = {};
            if (target.left !== undefined) {
                existing.left = parseInt(el.css('left'));
                if (existing.left != target.left) {
                    unmoved = false;
                }
            }
            if (target.top !== undefined) {
                existing.top = parseInt(el.css('top'));
                if (existing.top != target.top) {
                    unmoved = false;
                }
            }
            if (unmoved) {
                if (options.after) {
                    options.after();
                }
                return;
            }

            // Get time in seconds.
            var seconds;
            if (options.seconds) {
                seconds = options.seconds;
            } else {
                var speed = t.DEFAULT_SPEED;
                if (options.speed) {
                    speed = options.speed;
                }
                var distance;
                if (existing.left !== undefined && existing.top !== undefined) {
                    var xx = Math.pow(existing.left - target.left, 2);
                    var yy = Math.pow(existing.top - target.top, 2);
                    distance = Math.sqrt(xx + yy);
                } else if (existing.left !== undefined) {
                    distance = Math.abs(existing.left - target.left);
                } else {
                    distance = Math.abs(existing.top - target.top);
                }
                seconds = distance / speed;
            }

            el.data('inSlidePosition', true);
            t.animationStarted();
            el.css('transition', 'left ' + seconds + 's, top ' + seconds + 's');
            setTimeout(function() {
                if (target.left !== undefined) {
                    el.css('left', target.left + 'px');
                }
                if (target.top !== undefined) {
                    el.css('top', target.top + 'px');
                }
            }, 0);
            el.one('transitionend', function() {
                el.css('transition', '');
                el.removeData('inSlidePosition');
                t.animationFinished();
                if (options.after) {
                    options.after(true);
                }
            });
        },

        /**
         * Opens an element out downwards. The element should currently be set to
         * display:none. It will end up set to display:block and at its default
         * height.
         *
         * It is OK to call openDown before closeUp finishes. If you call
         * openDown when already opening down, it will be ignored.
         *
         * @public
         * @param el jQuery wrapped element
         * @param {number} [seconds] Length of transition
         */
        openDown : function(el, seconds) {
            return t.openClose(el, true, { seconds: seconds });
        },

        /**
         * Closes an element upwards. The element should currently be set to
         * display:block. It will end up set to display:none.
         *
         * It is OK to call closeUp before openDown finishes. If you call
         * closeUp when already closing up, it will be ignored.
         *
         * @public
         * @param el jQuery wrapped element
         * @param {number} [seconds] Length of transition
         * @returns {Boolean} True if it started a transition
         */
        closeUp : function(el, seconds) {
            return t.openClose(el, false, { seconds: seconds });
        },

        /**
         * Chooses a suitable open/close speed based on a given pixel height, with
         * a minimum time.
         *
         * @public
         * @param {number} height Height of element
         * @param {number} [min] Minumum time (uses DEFAULT_TIME if unspecified)
         * @returns {number} Time in seconds
         */
        getDefaultOpenTime : function(height, min) {
            if (min === undefined) {
                min = t.DEFAULT_TIME;
            }
            return Math.max(height / 2000, min);
        },

        /**
         * Opens or closes an element by adjusting its max-height.
         *
         * It is OK to change your mind and close while opening (or vice versa).
         *
         * NOTE: Because this uses max-height, which cannot go below zero, you
         * should ensure there is no vertical padding or border on the object
         * being opened or closed.
         *
         * Available options:
         * - seconds (transition time); if not specified, it will use
         *   getDefaultOpenTime to calculate)
         * - closedHeight (height when closed); the default is zero height,
         *   which will use display:none as well
         *
         * @public
         * @param el jQuery wrapped element
         * @param {Boolean} open True to open, false to close
         * @param {Object} [options] Options (see above)
         * @returns {Boolean} True if it started a transition
         */
        openClose : function(el, open, options) {
            if (options === undefined) {
                options = {};
            }
            options.mode = open ? 'open' : 'close';
            if (el.data('inOpenClose') && el.data('inOpenClose').mode === options.mode) {
                return false;
            }
            if (!options.closedHeight) {
                options.closedHeight = 0;
            }
            t.animationStarted();
            if (t.supportsTransitions()) {
                // If we're already in the opposite operation then call its after
                // function and switch direction.
                if (el.data('inOpenClose')) {
                    // Call the after function.
                    if (el.data('inOpenClose').after) {
                        el.data('inOpenClose').after();
                        t.animationFinished();
                    }
                } else {
                    if (options.mode === 'open') {
                        // Don't change display property if it is something with closed
                        // height because then it's always visible.
                        if (options.closedHeight === 0) {
                            el.css('display', 'block');
                        }
                        el.css('max-height', '');
                    }
                    el.data('originalHeight', el.height());
                    if (options.seconds === undefined) {
                        options.seconds = t.getDefaultOpenTime(el.data('originalHeight') - options.closedHeight);
                    }
                    if (options.mode === 'close') {
                        el.css('max-height', el.data('originalHeight') + 'px');
                    } else {
                        el.css('max-height', options.closedHeight + 'px');
                    }

                    // The following line should do nothing, but is necessary for it to work on
                    // Safari (the version in iOS 10 and corresponding Mac version). Without this,
                    // the max-height value gets set to zero and the section briefly disappears.
                    el.css('max-height');

                    el.css('transition', 'max-height ' + options.seconds + 's');
                    el.css('overflow', 'hidden');
                    el.one('transitionend', function() {
                        t.openCloseEnd(el);
                    });
                }
                el.data('inOpenClose', options);
                setTimeout(function() {
                    var targetHeight;
                    if (options.mode === 'open') {
                        targetHeight = el.data('originalHeight');
                    } else {
                        targetHeight = options.closedHeight;
                    }
                    var height = parseInt(el.css('height'));
                    el.css('max-height', targetHeight + 'px');
                    // If max-height happens to be same as current, we'll never
                    // get a transition end event, so call one manually.
                    if (height == targetHeight) {
                        t.openCloseEnd(el, options);
                    }
                }, 0);
            } else {
                // Immediately end the transition since there isn't one.
                t.openCloseEnd(el, options);
            }
            return true;
        },

        /**
         * Internal function used when open/close transition ends.
         *
         * @private
         * @param el jQuery wrapped element
         */
        openCloseEnd : function(el) {
            // Get data (and return if already handled).
            var options = el.data('inOpenClose');
            if (!options) {
                return;
            }

            el.removeData('inOpenClose');
            el.removeData('originalHeight');
            el.css('overflow', '');
            if (options.mode === 'open') {
                el.css('transition', '');
                el.css('max-height', '');
            } else if (options.mode === 'close') {
                el.css('transition', '');
                if (options.closedHeight > 0) {
                    el.css('max-height', options.closedHeight + 'px');
                } else {
                    el.css('display', 'none');
                    el.css('max-height', '');
                }
            }
            if (el.data('clickdisable') == 'disabled') {
                el.removeData("clickdisable");
            }
            if (options.after) {
                options.after();
            }
            t.animationFinished();
        },

        /**
         * Opens down a section while fading out a 'show' link and fading in a
         * 'hide' link.
         *
         * You can supply two callbacks 'after' (after it completes) and
         * 'halftime' (when the hide button is now fading in). You can also
         * specify the display type used for the link (default inline) and
         * whether or not it should automatically focus the link (default true).
         *
         * @public
         * @param el jQuery wrapped element
         * @param showLink jQuery wrapped element for 'show' link
         * @param hideLink jQuery wrapped element for 'hide' link
         * @param {number} [seconds] Length of transition
         * @param {Object} [options] Options (may include linkDisplay, after, halfTime)
         */
        openDownAndToggleLink : function(el, showLink, hideLink, seconds, options) {
            if (options === undefined) {
                options = {};
            }
            if (options.linkDisplay === undefined) {
                options.linkDisplay = 'inline';
            }
            if (options.focus === undefined) {
                options.focus = true;
            }
            el.css('display', 'block');
            if (seconds === undefined) {
                seconds = t.getDefaultOpenTime(el.height());
            }
            el.css('display', 'none');
            t.openDown(el, seconds);
            t.fadeOut(showLink, seconds / 2, { after : function() {
                t.fadeIn(hideLink, seconds / 2, { display: options.linkDisplay, after: options.after });
                if (options.focus) {
                    hideLink.focus();
                }
                if (options.halfTime) {
                    options.halfTime();
                }
            } });
        },

        /**
         * Closes up a section while fading out a 'hide' link and fading in a
         * 'show' link.
         *
         * You can supply two callbacks 'after' (after it completes) and
         * 'halftime' (when the show button is now fading in). You can also
         * specify the display type used for the link (default inline) and
         * whether or not it should automatically focus the link (default true).
         *
         * @public
         * @param el jQuery wrapped element
         * @param showLink jQuery wrapped element for 'show' link
         * @param hideLink jQuery wrapped element for 'hide' link
         * @param {number} [seconds] Length of transition
         * @param {Object} [options] Options (may include linkDisplay, after, halfTime)
         */
        closeUpAndToggleLink : function(el, showLink, hideLink, seconds, options) {
            if (options === undefined) {
                options = {};
            }
            if (options.linkDisplay === undefined) {
                options.linkDisplay = 'inline';
            }
            if (options.focus === undefined) {
                options.focus = true;
            }
            if (seconds === undefined) {
                seconds = t.getDefaultOpenTime(el.height());
            }
            t.closeUp(el, seconds);
            t.fadeOut(hideLink, seconds / 2, { after : function() {
                t.fadeIn(showLink, seconds / 2, { display: options.linkDisplay, after: options.after });
                if (options.focus) {
                    showLink.focus();
                }
                if (options.halfTime) {
                    options.halfTime();
                }
            } });
        }
    };
    return t;
});
