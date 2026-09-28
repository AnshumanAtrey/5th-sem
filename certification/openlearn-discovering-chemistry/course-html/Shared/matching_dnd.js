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
 * JavaScript to allow dragging options to slots or tab through slots using keyboard.
 *
 * @package mod_oucontent
 * @copyright 2017 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module mod_oucontent/matching_dnd
 */

define(['jquery', 'theme_osep/animations', 'theme_osep/drag'], function ($, animations, drag) {

    "use strict";

    /**
     * @alias module:mod_oucontent/matching_dnd
     */
    var t = {
        /**
         * The accuracy of the drag item in brink of a slot to be accepted.
         * @private
         */
        DRAG_ACCURACY : 25,

        /**
         * Animation time in milliseconds
         * @private
         */
        ANIMATION_DURATION : 800,

        /**
         * When container width is greater than 450px we can use two columns.
         * @private
         */
        CHANGECOLUMNWIDTH : 450,

        /**
         * When container width is smaller than 320px lowearea wraps.
         * @private
         */
        CONTAINERWIDTHPHONE : 3200,

        /**
         * The extra height for lowerArea with buttons and feedback text.
         * @private
         */
        EXTRALOWERAREAHEIGHTPHONE : 30,

        /**
         * The size of the gap between items in px.
         * @private
         */

        GAP : 8,

        /**
         * An object that holds array of string which need to be passed on to js.
         */
        jsstrings : {},

        /**
         * Populate t.jsstring, loop through instances and adjust formation of instances 0n resize.
         */
        init : function () {
            // Make sure M.mod_oucontent is loaded before running init function,
            // so we can populate t.jssting object.
            if (!M.mod_oucontent) {
                setTimeout(t.init, 50);
                return;
            }
            var questions = [];
            t.jsstrings = M.mod_oucontent.jsstrings;
            $('.oucontent-matching-container').each(function (index, node) {
                questions[index] = new t.questionInstance();
                questions[index].initInstance(node, node.oucontentmatches);
            });
            // On rorate screen,we should update height and width again.
            $(window).on('resize orientationchange', function() {
                $('.oucontent-matching-container').each(function (index, node) {
                    // Element need to be renderer first to get correct height or we will get previous height.
                    setTimeout(function(){
                        questions[index].adjustFormation(node, false);
                    });
                });
            });
        },

        questionInstance : function() {
            return {

                /**
                 * The object containing the data.
                 */
                dataFormation : {},
                /**
                 * The draggable element to be passed to onMove and OnDrop function if needed.
                 */
                dragProxy : null,
                /**
                 * The DOM container for the question.
                 */
                qContainer : null,

                /**
                 * Presenting an instance of interaction-matching.
                 *
                 * @param node
                 * @param items
                 */
                initInstance : function (node, items) {
                    var container = $('#' + $(node).attr('id').substring(8));
                    container.css('display', 'block');
                    this.qContainer = container;
                    this.setInitialFormation(node, items, container);

                    // Add Keyboard events.
                    for (var i = 0; i < this.dataFormation.slots.length; i++) {
                        var slot = this.dataFormation.slots[i];
                        this.addKeyboardEvents(container, slot);
                    }

                    // Add drag and drop events.
                    for (i = 0; i < this.dataFormation.options.length; i++) {
                        var dragProxy = this.dataFormation.options[i];
                        dragProxy.css({'cursor': 'move'});
                        dragProxy.addClass('.moodle-has-zindex');
                        dragProxy.on('mousedown touchstart', this.getMouseDownOrTouchStart(dragProxy));
                    }
                },

                /**
                 * Structure the data and add them to the container.
                 *
                 * @param node
                 * @param items
                 * @param container
                 */
                setInitialFormation: function(node, items, container) {
                    // Elements Formation.
                    this.dataFormation.options = [];
                    this.dataFormation.help = $('<div class="oucontent-interactionhelp" ><p>' +
                        t.jsstrings.interaction_matching_info + '</p></div>');
                    this.dataFormation.matches = [];
                    this.dataFormation.slots = [];

                    this.dataFormation.answer = container.parent().find('.oucontent-saq-interactiveanswer');
                    this.dataFormation.discussion = container.parent().find('.oucontent-saq-interactivediscussion');

                    this.dataFormation.lowerArea = this.displayLowerArea(container);

                    // Set height and width for all options.
                    var d = this.getDimension(container.width(), items);

                    // Add gap to the height.
                    d.height += t.GAP;
                    for (var i = 0; i < items.length; i++) {
                        var option = $('#' + items[i].option);
                        var match = $('#' + items[i].match);
                        var slot = this.createDropSlot(d.width, d.height, i);

                        // Display slot in desktop view at the same level of mathcing paragraph.
                        if (this.useDesktopView(container.width())) {
                            slot.css('margin-top', t.GAP + 'px');
                        }
                        // Set original position.
                        option.originalPosition = option.position();
                        option.data('inSlot', false);

                        // Associate option with matching slot by storing 'matchid' in both objects.
                        option.data('matchid', match.prop('id'));
                        slot.data('matchid', match.prop('id'));

                        this.dataFormation.options.push(option);
                        this.dataFormation.matches.push(match);
                        this.dataFormation.slots.push(slot);
                    }
                    // Shuffle options.
                    this.dataFormation.options = this.shuffleOptions(this.dataFormation.options);

                    this.dataFormation.help.data(
                        {
                            'string': t.jsstrings.interaction_matching_info,
                            'left': 0,
                            'width': d.width,
                            'height': d.height,
                            'mHeights': d.mHeights,
                            'helpHeight': d.helpHeight,
                            'dimention' : d
                        }
                    );
                    container.append(this.dataFormation.options);
                    container.append(this.dataFormation.matches);
                    container.append(this.dataFormation.slots);
                    container.append(this.dataFormation.lowerArea);
                    this.addSkipLink(container);
                    this.adjustFormation(node);
                },

                /**
                 * Adjust the positions of all elements based on screen/container size.
                 *
                 * @param node
                 * @param isinitialformation boolean check if this intinialformation data or updated formation data.
                 */
                adjustFormation: function(node, isinitialformation) {
                    isinitialformation = typeof isinitialformation !== 'undefined' ? isinitialformation : true;
                    var container = $('#' + $(node).attr('id').substring(8));
                    var containerwidth = container.width();
                    var height = this.dataFormation.help.data('height');
                    var width = this.dataFormation.help.data('width');
                    var mHeights = this.dataFormation.help.data('mHeights');
                    var helpHeight = this.dataFormation.help.data('helpHeight');
                    var optionsHeight = 0;
                    var p = {};

                    // Position options.
                    for (var i = 0; i < this.dataFormation.options.length; i++) {
                        p = this.adjustPosition(containerwidth, i, height);
                        this.dataFormation.options[i].css(
                            {
                                'top': p.top + 'px',
                                'left': p.left + 'px',
                                'height': p.height + 'px',
                                'width': p.width + 'px'
                            }
                        );
                        // Set the option position when attached to a slot.
                        if (this.dataFormation.options[i].data('inSlot') === true) {
                            this.dataFormation.options[i].css(
                                {
                                    'top': 0,
                                    'left': 0
                                }
                            );
                        }
                        this.dataFormation.options[i].originalPosition = this.dataFormation.options[i].position();

                        // Calculate the height of all options including the gaps.
                        if (p.left === 0) {
                            optionsHeight += p.height + t.GAP;
                        }
                    }

                    // Position help string.
                    var help = this.dataFormation.help;
                    help.css(
                        {
                            'top': optionsHeight + 'px',
                            'left': 0,
                            'width': containerwidth + 'px',
                            'height': helpHeight + 'px',
                            'position': 'absolute'
                        }
                    );
                    container.append(help);

                    helpHeight = parseInt(help.css('height')) + t.GAP;

                    this.dataFormation.help.data('height', p.height);
                    this.dataFormation.help.data('width', p.width);
                    var nextTop = p.top + helpHeight + p.height + t.GAP;

                    // Position matches and slots.
                    for (i = 0; i < this.dataFormation.matches.length; i++) {
                        width = Math.floor(containerwidth);

                        var mHeight = mHeights[i];
                        var mTop = nextTop;
                        var mLeft = 0;

                        var sTop = mTop + mHeight - t.GAP;
                        var sLeft = 0;

                        if (this.useDesktopView(containerwidth)) {
                            mHeight = (mHeight > height) ? mHeight : height + t.GAP;
                            sLeft = (width / 2) + t.GAP;
                            width /= 2;
                            sTop = mTop;
                            nextTop += mHeight;
                        } else {
                            nextTop += mHeight + height + t.GAP;
                        }
                        this.dataFormation.matches[i].css(
                            {
                                'display': 'block',
                                'top': mTop + 'px',
                                'left': mLeft,
                                'width': width + 'px',
                                'height': mHeight + 'px'
                            }
                        );
                        this.dataFormation.slots[i].css(
                            {
                                'top': sTop + 'px',
                                'left': sLeft + 'px',
                                'width': width + 'px',
                                'height': height + 'px'
                            }
                        );
                    }
                    var totalHeight = nextTop;
                    var lowerAreaHeight = parseInt(this.dataFormation.lowerArea.css('height'));
                    this.dataFormation.lowerArea.css(
                        {
                            'left': 0,
                            'top': (totalHeight + t.GAP) + 'px',
                            'width': containerwidth + 'px'
                        }
                    );
                    var newTotalHeight = 0;
                    var rightWrong = container.parent().find('.oucontent-interactionrightwrong');
                    if (rightWrong && rightWrong.css('display') == 'none') {
                        newTotalHeight = totalHeight - 23;
                    } else if (rightWrong && rightWrong.css('display') == 'block' && !isinitialformation) {
                        newTotalHeight = totalHeight - 30;
                    }
                    if (containerwidth < t.CONTAINERWIDTHPHONE) {
                        if (newTotalHeight > 0) {
                            container.css('height', newTotalHeight + lowerAreaHeight + t.EXTRALOWERAREAHEIGHTPHONE + t.GAP + 'px');
                        } else {
                            container.css('height', totalHeight + lowerAreaHeight + t.EXTRALOWERAREAHEIGHTPHONE + t.GAP + 'px');
                        }
                    } else {
                        container.css('height', totalHeight + lowerAreaHeight + t.GAP + 'px');
                    }
                },

                /**
                 * Call keydown event handler when tabbing to a slot.
                 *
                 * @param container
                 * @param slot
                 */
                addKeyboardEvents: function(container, slot) {
                    var q = this;
                    slot.on('focus', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        slot.addClass('oucontent-matching-focus');
                    });
                    slot.on('blur', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        slot.removeClass('oucontent-matching-focus');
                        slot.addClass('oucontent-matching-blur');
                    });
                    slot.on('keydown', function (e) {
                        q.revealButton.attr('disabled', q.revealButtonStatus());
                        q.keyDownHandler(e, container, slot);
                        q.revealButton.attr('disabled', q.revealButtonStatus());
                    });
                },

                /** Add skip link to accessible version of matching question.
                 *
                 * @param container
                 */
                addSkipLink : function(container) {
                    var q = this;
                    var id = $(container).attr('id');
                    var skipLink = $('<a href="#matching_access_' + id + '"></a>');

                    skipLink.on('click', function(e) {
                        e.preventDefault();
                        q.addReturnLink(container, skipLink);

                        $(container).hide();
                        $(container).parent().find('div.oucontent-interaction-print').attr('id', 'matching_access_' + id).show();
                        skipLink.hide();

                        return true;
                    });

                    skipLink.html(t.jsstrings.interaction_skip_matching);
                    container.before(skipLink);
                },

                /**
                 * Add return link to normal version of matching question.
                 *
                 * @param container
                 * @param skipLink link.
                 */
                addReturnLink : function(container, skipLink) {
                    var id = $(container).attr('id');
                    var returnLink = $('<a href="#close_matching_access_' + id + '"></a>');

                    // Return to match version.
                    returnLink.on('click', function(e) {
                        e.preventDefault();

                        $(container).show();
                        $(container).parent().find('div.oucontent-interaction-print').attr('id', 'matching_access_' + id).hide();
                        skipLink.show();
                        returnLink.hide();

                        return true;
                    });

                    returnLink.html(t.jsstrings.interaction_return_matching);
                    container.before(returnLink);
                },

                /**
                 * Prepare and return the lower area such as button and answer feedback.
                 *
                 * @param container
                 * @returns lowerArea object
                 */
                displayLowerArea : function(container) {
                    var q = this;
                    var lowerArea = $('<div class="oucontent-interaction-lower"/>');
                    lowerArea.css(
                        {
                            'position': 'relative',
                            'width': container.width() + 'px',
                            'left': 0
                        }
                    );
                    // Add the buttons.
                    var buttons = $('<div class="oucontent-interactionbuttons"/>');

                    // Right align the buttons with the slots and option.
                    if (this.useDesktopView(container.width())) {
                        buttons.css('margin-right', '-18px');
                    } else {
                        buttons.css('margin-right', '-10px');
                    }
                    var checkButton = $('<input type="button"/>');
                    var revealButton = $('<input type="button"/>');

                    this.setInputValue(checkButton, t.jsstrings.interaction_check_your_answer);
                    checkButton.attr('disabled', false);
                    var rightWrong = $('<div class="oucontent-interactionrightwrong"/>');
                    rightWrong.before(buttons);
                    rightWrong.css('display', 'none');

                    checkButton.on('click', function(e) {
                        e.preventDefault();
                        rightWrong = q.checkHandler(e, rightWrong);
                    });
                    buttons.append(checkButton);
                    buttons.append(document.createTextNode(' '));
                    if (!container.hasClass('oucontent-specimen-answer')) {
                        this.setInputValue(revealButton, t.jsstrings.interaction_reveal_answer);
                    } else {
                        this.setInputValue(revealButton, t.jsstrings.interaction_reveal_specimen_answer);
                    }

                    revealButton.attr('disabled', false);
                    revealButton.on('click', function(e) {
                        e.preventDefault();
                        q.revealHandler();
                    });
                    this.revealButton = revealButton;
                    buttons.append(revealButton);
                    buttons.css('position', 'relative');
                    lowerArea.append(buttons);
                    lowerArea.append(rightWrong);
                    return lowerArea;
                },

                /**
                 * Adjusting the position of each element based on screen/container width.
                 *
                 * @param containerwidth the width of the container
                 * @param i an integer indicating the current element in the loop
                 * @param height generic height (option, slot)
                 * @returns object p {height: number, mHeight: number, width: number, top: number, left: number}
                 */
                adjustPosition : function (containerwidth, i, height) {
                    var p = {
                        'height' : Math.floor(height),
                        'width' : Math.floor(containerwidth),
                        'top' : 0,
                        'left' : 0
                    };
                    var modulus = i % 2 === 0;

                    // Desktop view two columns.
                    if (this.useDesktopView(containerwidth)) {
                        p.width /= 2;
                        p.top = Math.floor(Math.floor(i / 2) * (height + t.GAP));
                        if (modulus === false) {
                            p.left = p.width + t.GAP;
                        }
                    } else { // Mobile view / desktop view (when container is not wide enough), one column.
                        p.top = Math.floor(i * (height + t.GAP));
                    }
                    return p;
                },

                /**
                 * getDimension calculates and returns width and height of items
                 * based on largest item and adjust the height according to container width
                 *
                 * @param containerwidth
                 * @param items
                 * @returns dimension object
                 */
                getDimension : function(containerwidth, items) {
                    var dimension = {
                        'height' : 0, // The generic height of all options and slots
                        'width' : 0, // The generic width of all options, matches and slots
                        'mHeights' : [], // The generic heights of matches (useful when items displayed in one column)
                        'oLength' : 0, // The length of innerText.
                        'mLengths' : [], // The length of innerText.
                        'oImageHeight' : 0, // The generic height of all images within the options
                        'helpHeight' : 40,// The height of help string.
                    };

                    for (var i = 0; i < items.length; i++) {
                        var option = $('#' + items[i].option);
                        var match = $('#' + items[i].match);

                        var height = option.height();
                        var width = option.width();
                        dimension.mHeights[i] = match.height();
                        var oLength = option[0].innerText.length;
                        dimension.mLengths[i] = match[0].innerText.length;
                        var oImageHeight = this.getImageHeight(option);
                        var mImageHeight = this.getImageHeight(match);
                        // Options dimension.
                        if (height > dimension.height) {
                            dimension.height = height;
                        }
                        if (width > dimension.width) {
                            dimension.width = width;
                        }
                        if (oLength > dimension.oLength) {
                            dimension.oLength = oLength;
                        }
                        // Matches dimension.
                        if (oImageHeight > dimension.oImageHeight) {
                            dimension.oImageHeight = oImageHeight;
                        }
                        if (mImageHeight > dimension.mImageHeight) {
                            dimension.mImageHeight = mImageHeight;
                        }
                    }
                    // Display items in two columns.
                    if (this.useDesktopView(containerwidth)) {
                        dimension = this.computeHeight(containerwidth, dimension);
                    }
                    return dimension;
                },

                /**
                 * Get the height of the image
                 *
                 * @param selector
                 * @returns int
                 */
                getImageHeight: function (selector) {
                    var imgHeight = selector.find('img').height();
                    if (this.isEmpty(imgHeight)) {
                        return 0;
                    }
                    return imgHeight;
                },

                /**
                 * Compute height for desktop view
                 *
                 * @param containerwidth
                 * @param dimension
                 * @returns dimension object
                 */
                computeHeight: function (containerwidth, dimension) {
                    // Compute a generic height for all options and slots.
                    if (this.isEmpty(dimension.oImageHeight)) {
                        dimension.height = this.calculateTextHeight(
                            containerwidth, dimension.height, dimension.oLength);
                    } else {
                        dimension.height = dimension.oImageHeight + this.calculateTextHeight(
                            containerwidth, (dimension.height - dimension.oImageHeight), dimension.oLength);
                    }
                    // Compute height for each mach.
                    for (var i = 0; i< dimension.mHeights.length; i++) {
                        if (this.isEmpty(dimension.mImageHeight)) {
                            dimension.mHeights[i] = this.calculateTextHeight(
                                containerwidth, dimension.mHeights[i], dimension.mLengths[i]);
                        } else {
                            dimension.mHeights[i] = dimension.mImageHeight + this.calculateTextHeight(
                                containerwidth, (dimension.mHeight[i] - dimension.mImageHeight), dimension.mLengths[i]);
                        }
                    }
                    return dimension;
                },

                /**
                 * Calculate the actual text height based on the length
                 * of the text and width of the item in desktop view.
                 *
                 * @param height (The original text height)
                 * @param width (The container width)
                 * @param length (The text length)
                 * @returns number (The calculated height)
                 */
                calculateTextHeight: function(width, height, length) {
                    height += this.getLengthFactor(length);
                    return height * this.getWidthFactor(width);
                },

                /**
                 * Get length factor to be added to the height
                 *
                 * @param textLength
                 * @returns {number}
                 */
                getLengthFactor: function(textLength) {
                    return textLength * 0.3;
                },

                /**
                 * Get width factor to be multiplay by height
                 *
                 * @param containerwidth
                 * @returns {number}
                 */
                getWidthFactor: function(containerwidth) {
                    return (containerwidth + (0.03 * containerwidth)) / containerwidth;
                },

                /**
                 * Display in two column if container is wide enough.
                 *
                 * @param containerwidth
                 * @returns {boolean}
                 */
                useDesktopView: function (containerwidth) {
                    if (($(window).width() > 767) && (containerwidth > t.CHANGECOLUMNWIDTH)) {
                        return true;
                    }
                    return false;
                },

                /**
                 * Create a slot with the same generic hight and width of the options
                 *
                 * @param width generic width of the options
                 * @param height generic height of the options
                 * @param i integer for creating a unique id for each slot
                 * @returns slot object
                 */
                createDropSlot : function(width, height, i) {
                    var slotId = "oucontent-matching-slot-" + i;
                    var slot = $('<div id=' + '"' + slotId + '" class="oucontent-matching-slot"/>');
                    slot.css(
                        {
                            'width': width + "px",
                            'height': height + "px"
                        }
                    );
                    slot.addClass('oucontent-matching-slot-bgoriginal');
                    slot.prop('tabindex', 0);
                    return slot;
                },

                /**
                 * Shuffle items randomly
                 *
                 * @param options
                 * @returns {Array}
                 */
                shuffleOptions : function (options) {
                    var shuffledoptions = new Array(options.length);
                    for (var i = 0; i < options.length; i++) {
                        shuffledoptions[i] = options[i];
                        shuffledoptions[i].sortorder = Math.random();
                    }
                    shuffledoptions.sort(function(a, b) {
                        return (a.sortorder < b.sortorder) ? -1 : 1;
                    });
                    return shuffledoptions;
                },

                /**
                 * Return a function on mousedown or touchstars.
                 * @param dragProxy
                 * @returns {Function}
                 */
                getMouseDownOrTouchStart : function(dragProxy) {
                    var q = this;
                    return function(e) {
                        if (drag.prepare(e).start === true) {
                            q.dragProxy = dragProxy;
                            q.dragProxy.data('statusondrop', 'notremove');
                            var om = function () {
                                q.onMove(q);
                            };
                            var od = function () {
                                q.onDrop(q);
                            };
                            drag.start(e, q.dragProxy, om, od);
                        }
                    };
                },

                /**
                 * Called when user drags a drag item.
                 *
                 * @private
                 */
                onMove : function(curq) {
                    curq.dragProxy.css('z-index', 2);
                    for (var i = 0; i < curq.dataFormation.slots.length; i++) {
                        var option = curq.dragInSlot(curq.dataFormation.slots[i]);
                        if (!curq.isEmpty(option)) {
                            // Return if droping the existing option in the same slot.
                            if (curq.isSameDrag(option)) {
                                curq.dataFormation.slots[i].removeClass('oucontent-matching-slot-bgondrop');
                                curq.dataFormation.slots[i].addClass('oucontent-matching-slot-bgoriginal');
                                return;
                            }
                            if (curq.isDragCloseToTarget(curq.dragProxy, curq.dataFormation.slots[i])) {
                                option.removeClass('oucontent-matching-option-bgoriginal');
                                option.addClass('oucontent-matching-option-bgondrop');
                            } else {
                                option.removeClass('oucontent-matching-option-bgondrop');
                                option.addClass('oucontent-matching-option-bgoriginal');
                            }
                        }
                        if (curq.isDragCloseToTarget(curq.dragProxy, curq.dataFormation.slots[i])) {
                            curq.dataFormation.slots[i].removeClass('oucontent-matching-slot-bgoriginal');
                            curq.dataFormation.slots[i].addClass('oucontent-matching-slot-bgondrop');
                        } else {
                            curq.dataFormation.slots[i].removeClass('oucontent-matching-slot-bgondrop');
                            curq.dataFormation.slots[i].addClass('oucontent-matching-slot-bgoriginal');
                        }
                    }
                },

                /**
                 * Check whether a slot contains an option and returns the option.
                 *
                 * @param slot the slot object which may contain an option object
                 * @returns option object if slot contains an option or null if it doesn't
                 */
                dragInSlot : function(slot) {
                    if (!slot) {
                        return null;
                    }
                    var option = slot.children();
                    if (option.length) {
                        // Disable the "Reveal answer" button.
                        for (var i = 0; i < this.dataFormation.options.length; i++) {
                            if (option.data('matchid') === this.dataFormation.options[i].data('matchid')) {
                                option.data('inSlot', true);
                                this.revealButton.attr('disabled', true);
                                return option;
                            }
                        }
                    }
                    slot.removeClass('oucontent-matching-slot-bgondrop');
                    slot.addClass('oucontent-matching-slot-bgoriginal');
                    this.revealButton.attr('disabled', false);
                    return null;
                },

                /**
                 * Called when user drops and a drag item and applies the change.
                 *
                 * @private
                 */
                onDrop : function(curq) {
                    for (var i = 0; i < curq.dataFormation.slots.length; i++) {
                        if (curq.isDragCloseToTarget(curq.dragProxy, curq.dataFormation.slots[i])) {
                            var option = curq.dragInSlot(curq.dataFormation.slots[i]);
                            if (!curq.isEmpty(option)) {
                                // Return if droping the existing option in the same slot.
                                if (curq.isSameDrag(option)) {
                                    return;
                                }
                                // Reset the drag item to the original position.
                                option.removeClass('oucontent-matching-option-bgondrop');
                                option.addClass('oucontent-matching-option-bgoriginal');
                                curq.dataFormation.slots[i].removeClass('oucontent-matching-slot-bgondrop');
                                curq.dataFormation.slots[i].addClass('oucontent-matching-slot-bgoriginal');
                                curq.putBackToOrigin(option);
                            }
                            curq.dragProxy.css('z-index', curq.dragProxy.css('z-index') -1);
                            curq.appendToSlot(this.dataFormation.slots[i], curq.dragProxy);
                            curq.revealButton.attr('disabled', curq.revealButtonStatus());
                            curq.dragProxy.css('cursor', 'auto');
                            return;
                        }
                    }
                    // Reset the drag item to the original position.
                    curq.putBackToOrigin(curq.dragProxy);
                },

                /**
                 * Return if droping the existing option in the same slot.
                 *
                 * @param option the drag object
                 */
                isSameDrag : function(option) {
                    if ((this.dragProxy.data('inSlot') === true) &&
                        (this.dragProxy.data('matchid') === option.data('matchid'))) {
                        return true;
                    }
                    return false;
                },

                /**
                 * putBackToOrigin puts the drag item out of the slot and back to the original position
                 *
                 * @param drag the option object
                 */
                putBackToOrigin: function(drag) {
                    drag.css({'cursor': 'move'});
                    for (var i = 0; i < this.dataFormation.options.length; i++) {
                        if (drag.data('matchid') !== this.dataFormation.options[i].data('matchid')) {
                            continue;
                        }
                        // Animate the option back to the original position.
                        var top = this.dataFormation.options[i].originalPosition.top + 'px';
                        var left = this.dataFormation.options[i].originalPosition.left + 'px';
                        this.animateEl(this.dataFormation.options[i], t.ANIMATION_DURATION, 'swing', top, left);

                        this.dataFormation.options[i].data('inSlot', false);
                        this.qContainer.append(this.dataFormation.options[i]);
                    }
                },

                /**
                 * isDragCloseToTarget checks whether the drag item is close enough to the target
                 *
                 * @param drag
                 * @param target
                 * @returns {boolean}
                 */
                isDragCloseToTarget : function(drag, target) {
                    var midDragX = drag.offset().left + drag.outerWidth() / 2;
                    var midDragY = drag.offset().top + drag.outerHeight() / 2;
                    var midTargetX = target.offset().left + target.outerWidth() / 2;
                    var midTargetY = target.offset().top + target.outerHeight() / 2;

                    // Is the drag item close to target?
                    if ((midDragX > (midTargetX - t.DRAG_ACCURACY) &&
                            midDragX < (midTargetX + t.DRAG_ACCURACY)) &&
                        (midDragY > (midTargetY - t.DRAG_ACCURACY) &&
                            midDragY < (midTargetY + t.DRAG_ACCURACY))) {
                        target.removeClass('oucontent-matching-slot-bgoriginal');
                        target.addClass('oucontent-matching-slot-bgondrop');
                        return true;
                    }
                    target.removeClass('oucontent-matching-slot-bgondrop');
                    target.addClass('oucontent-matching-slot-bgoriginal');
                    return false;
                },

                setInputValue : function(input, string) {
                    // Get rid of any HTML codes from string.
                    var safe = string.replace(/<[^>]+>/g,'');
                    safe = safe.replace('&amp;','&');
                    safe = safe.replace('&lt;','<');
                    safe = safe.replace('&gt;','>');
                    safe = safe.replace('&quot;',"'");
                    input.attr('value', safe);

                    // Set language code.
                    var match = string.match(/<span lang='([a-z]+)'/);
                    if (match) {
                        input.attr('lang', match[1]);
                    }
                },

                /**
                 * Validate val and return boolean.
                 *
                 * @param val
                 * @returns {boolean}
                 */
                isEmpty : function(val) {
                    return (val === undefined || val === null || val.length <= 0);
                },

                /**
                 * Append the option to the slot and set option's new position
                 *
                 * @param slot
                 * @param option
                 */
                appendToSlot : function (slot, option) {
                    option.data('inSlot', true);
                    option.css(
                        {
                            'top': 0,
                            'left': 0
                        }
                    );
                    //option.css('z-index', 10);
                    slot.append(option);
                },

                /**
                 * User can tab to a given slot and walk through options
                 * by adding/removing an option to/from the current slot using keyboard
                 *
                 * @param e
                 * @param container
                 * @param slot
                 */
                keyDownHandler : function(e, container, slot) {
                    var key = e.keyCode;
                    var i = 0;

                    // Get option currently in slot (if any).
                    var currentoption = this.dragInSlot(slot);
                    var currentoptionindex = -1;
                    if (currentoption) {
                        for (i = 0; i < this.dataFormation.options.length; i++) {
                            if (this.dataFormation.options[i].data('matchid') === currentoption.data('matchid')) {
                                currentoptionindex = i;
                                break;
                            }
                        }
                    }

                    var newoption = null;

                    if (key === 39 || key === 32 || key === 13) {
                        // Forward-keys cycle through the options and blank.
                        // 39 Right-arrow.
                        // 32 Space.
                        // 13 Return.
                        e.preventDefault();
                        e.stopPropagation();

                        for (i = currentoptionindex + 1; i !== currentoptionindex; i++) {
                            if (i === this.dataFormation.options.length) {
                                i = -1;
                            }
                            if (i === -1) {
                                // Yep you can do blank.
                                break;
                            }
                            if (this.dataFormation.options[i].data('inSlot') === false) {
                                // This item is not in a slot, so use is.
                                break;
                            }
                        }
                        if (i === -1) {
                            newoption = null;
                        } else {
                            this.dataFormation.options[i].data('inSlot', true);
                            newoption = this.dataFormation.options[i];
                        }
                    } else if (key === 37) {
                        // Back-key cycles through the options and blank.
                        // 37 Left-arrow.
                        e.preventDefault();
                        e.stopPropagation();
                        for (i = currentoptionindex - 1; i !== currentoptionindex; i--) {
                            if (i < -1) {
                                i = this.dataFormation.options.length - 1;
                            }
                            if (i === -1) {
                                // Yep you can do blank.
                                break;
                            }
                            if (this.dataFormation.options[i].data('inSlot') === false) {
                                // This item is not in a slot, so use it.
                                break;
                            }
                        }
                        if (i === -1) {
                            newoption = null;
                        } else {
                            this.dataFormation.options[i].data('inSlot', true);
                            newoption = this.dataFormation.options[i];
                        }
                    } else if (key === 46 || key === 8 || key === 27) {
                        // Delete-keys switch to blank.
                        // 46 Delete.
                        // 8 Backspace.
                        // 27 Escape.
                        e.preventDefault();
                        e.stopPropagation();
                        newoption = null;
                        slot.addClass('oucontent-matching-slot-bgoriginal');
                    } else {
                        // They pressed some other key, don't do anything.
                        return;
                    }

                    // Set new option if any.
                    if (newoption) {
                        this.appendToSlot(slot, newoption);
                    }
                    // Move current option back.
                    if (currentoption) {
                        this.putBackToOrigin(currentoption);
                    }
                },

                /**
                 * Check the answers, translate the string to the correct format and return rightWrong.
                 *
                 * @param e
                 * @param rightWrong
                 * @returns {*}
                 */
                checkHandler : function(e, rightWrong) {
                    var notanswered = 0;
                    var correctanswers = 0;
                    var numberOfSlots = this.dataFormation.slots.length;
                    var response = [];

                    for (var s = 0; s < numberOfSlots; s++) {
                        var option = this.dragInSlot(this.dataFormation.slots[s]);
                        if (this.isEmpty(option)) {
                            notanswered++;
                            continue;
                        }
                        // If answered correctly, increment correctanswers variable.
                        if (option.data('matchid') === this.dataFormation.slots[s].data('matchid')) {
                            ++correctanswers;
                        } else {
                            // Animate the incorrect answers back to the original positions.
                            this.putBackToOrigin(option);
                            this.dataFormation.slots[s].removeClass('oucontent-matching-slot-bgondrop');
                            this.dataFormation.slots[s].addClass('oucontent-matching-slot-bgoriginal');
                        }
                    }
                    var invalidinput = '<img src="' + M.mod_oucontent.pix.invalidinput + '" class="invalid-input" alt="" />';
                    var wronganswer = '<img src="' + M.mod_oucontent.pix.wronganswer + '" class="wrong-answer" alt="" />';
                    var rightanswer = '<img src="' + M.mod_oucontent.pix.rightanswer + '" class="right-answer" alt="" />';
                    var retry = '<img src="' + M.mod_oucontent.pix.retry + '" alt="" class="retry" />';
                    var msg = '';
                    var buttonsH = parseInt(this.qContainer.find(".oucontent-interactionbuttons").css('height'));
                    if (notanswered === numberOfSlots) {
                        // Add class for new design.
                        rightWrong.addClass('invalid-input-interfaction');
                        this.qContainer.addClass('invalid-input-container');
                        // Nothing answered and we press the Check your answer button.
                        // String: Please choose at least one of the answers.
                        msg = invalidinput + '<b>' + t.jsstrings.interaction_please_choose_n + '</b>';
                    } else if (correctanswers === 0) {
                        // Add class for new design.
                        rightWrong.addClass('wrong-answer-interfaction');
                        this.qContainer.addClass('wrong-answer-container');
                        // None of the answers are correct.
                        // String: No, that's not correct.
                        msg = wronganswer + t.jsstrings.interaction_not_correct;
                    } else if (correctanswers === numberOfSlots) {
                        // Add class for new design.
                        rightWrong.addClass('correct-answer-interfaction');
                        this.qContainer.addClass('correct-answer-container');
                        // All of the answers are correct.
                        // String: Yes, that's correct.
                        msg = rightanswer + t.jsstrings.interaction_correct;
                        // Show text answer if provided.
                        if (this.dataFormation.answer) {
                            this.dataFormation.answer.css('display', 'block');
                        }
                        // Show text discussion if provided.
                        if (this.dataFormation.discussion) {
                            this.dataFormation.discussion.css('display', 'block');
                        }

                        // Do not display the buttons after all answers are correct.
                        this.qContainer.find(".oucontent-interactionbuttons").css('display', 'none');
                    } else if (correctanswers === 1) {
                        // Add class for new design.
                        rightWrong.addClass('retry-singular-interfaction');
                        this.qContainer.addClass('retry-singular-container');
                        // One of the answers is correct.
                        // String: You have 1 of the correct answers.
                        msg = retry + t.jsstrings.interaction_correct_incomplete_singular;
                    } else {
                        // Add class for new design.
                        rightWrong.addClass('retry-plural-interfaction');
                        this.qContainer.addClass('retry-plural-container');
                        // Not all, but more than one answers are correct.
                        // String: You have [N] of the correct answers.
                        msg = retry + t.jsstrings.interaction_correct_incomplete_plural;
                    }
                    rightWrong.html(msg.replace("#1", "<b>" + correctanswers + "</b>"));
                    for (var i = 0; i < response.length; i++) {
                        rightWrong.appendTo(response[i]);
                    }
                    if (rightWrong && rightWrong.css('display') == 'none') {
                        if (correctanswers === numberOfSlots) {
                            this.qContainer.css('height', this.qContainer.height() + rightWrong.height() - 17 - buttonsH);
                        } else {
                            this.qContainer.css('height', this.qContainer.height() + rightWrong.height() + 2);
                        }
                    } else if (correctanswers === numberOfSlots) {
                        this.qContainer.css('height', this.qContainer.height() - 17 - buttonsH);
                    }
                    rightWrong.css('display', 'block');
                    this.dataFormation.lowerArea.append(rightWrong);
                    return rightWrong;
                },

                /**
                 * Reveal answer by putting the options into the corresponding correct slots.
                 */
                revealHandler : function() {
                    for (var i = 0; i < this.dataFormation.options.length; i++) {
                        var targetId = this.dataFormation.options[i].data('matchid');
                        for (var s = 0; s < this.dataFormation.slots.length; s++) {

                            var matchId = this.dataFormation.slots[s].data('matchid');
                            if (targetId === matchId) {
                                $(this.dataFormation.options[i]).css({top: 0, left: 0});
                                this.animateEl(this.dataFormation.options[i], t.ANIMATION_DURATION, 'swing', 0, 0);
                                //s.animateEl(s.dataFormation.options[i], 'slow', 'swing', 0, 0);
                                this.appendToSlot(this.dataFormation.slots[s], this.dataFormation.options[i]);
                            }
                        }
                    }
                    // Do not display the buttons after animation.
                    this.qContainer.find(".oucontent-interactionbuttons").css('display', 'none');
                    var buttonsH = parseInt(this.qContainer.find(".oucontent-interactionbuttons").css('height'));
                    var rightWrong = this.qContainer.find('.oucontent-interactionrightwrong');
                    if (rightWrong && rightWrong.css('display') == 'none') {
                        this.qContainer.css('height', this.qContainer.height() - buttonsH);
                    } else {
                        // Add class for new design when reveal answer.
                        if (rightWrong.find('.invalid-input').length) {
                            rightWrong.removeClass('invalid-input-interfaction');
                            this.qContainer.removeClass('invalid-input-container');
                        } else if (rightWrong.find('.wrong-answer').length) {
                            rightWrong.removeClass('wrong-answer-interfaction');
                            this.qContainer.removeClass('wrong-answer-container');
                        } else if (rightWrong.find('.retry').length) {
                            rightWrong.removeClass('retry-singular-interfaction retry-plural-interfaction');
                            this.qContainer.removeClass('retry-plural-container retry-singular-container');
                        }
                        this.qContainer.css('height', this.qContainer.height() - rightWrong.height() - buttonsH + 2);
                        rightWrong.css('display', 'none');
                    }
                    // Show text answer if provided.
                    if (this.dataFormation.answer) {
                        this.dataFormation.answer.css('display', 'block');
                    }
                    // Show text discussion if provided.
                    if (this.dataFormation.discussion) {
                        this.dataFormation.discussion.css('display', 'block');
                    }
                },

                /**
                 * Checks whether revealButton should be enabled od disabled.
                 */
                revealButtonStatus : function () {
                    for (var i = 0; i < this.dataFormation.options.length; i++) {
                        if (this.dataFormation.options[i].data('inSlot') === true) {
                            return true;
                        }
                    }
                    return false;
                },


                // Callback function to bring a hidden box back
                callback : function (el) {
                    setTimeout(function() {
                        el.removeAttr( "style" ).hide().fadeIn();
                    }, 1000 );
                },

                /**
                 * Animate the object to the given destination.
                 *
                 * @param el object: the object to be animated
                 * @param duration int: duration on animation in miliseconds
                 * @param easing string: the easing type
                 * @param top css value of top
                 * @param left css value of left
                 */
                animateEl: function (el, duration, easing, top, left) {
                    el.animate(
                        {
                            opacity: 0.2,
                            width : parseInt(el.css('width')) + 5 + 'px',
                            height : parseInt(el.css('height')) + 5 + 'px',
                            top: (parseInt(top) + 5) + 'px',
                            left: (parseInt(left) + 5) + 'px',
                        },
                        {
                            duration: duration,
                            easing: easing
                        }
                    );
                    el.animate(
                        {
                            opacity: 1,
                            width : el.css('width'),
                            height : el.css('height'),
                            top: top,
                            left: left
                        },
                        {
                            duration: duration,
                            easing: easing
                        }
                    );
                }
            };
        }
    };
    return t;
});
