// This file contains extra JavaScript required only for the alt formats
// implementation in order to use oucontent.js

var M = {}; M.yui = {};

M.util = M.util || {};

M.util.js_pending = function() {};

M.util.get_string = function() { return '';};

M.util.image_url = function() {return '';};

var ALTFORMATS_EXTRA = {
    //Free Response functions

    // Used by freeresponse.init()
    isLocalStorageAvailable : function () {
        // These are only supported if window.localStorage is available. For some
        // reason it throws an error in IE if we test it the normal way, so test
        // a different way instead.
        try {
            var storage = window.localStorage;
            storage.setItem('localstoragetest', 'localstoragetest');
            storage.removeItem('localstoragetest');
        } catch (e) {
            if (window.console) {
                console.log('Local storage not supported');
            }
            return false;
        }
        return true;
    },

    // Used by freeresponse.init_one() and freeresponse.init_cell()
    initFreeResponse : function (form) {
        // Make it visible and get rid of the unsupported warning.
        var wrapper = document.getElementById(form.freeResponse + '-supported');
        wrapper.style.display = 'block';
        var unsupported = document.getElementById(form.freeResponse + '-unsupported');
        unsupported.parentNode.removeChild(unsupported);

        var buttonsId = form.tableId ? form.tableId : form.freeResponse;
        var buttons = document.getElementById(buttonsId + '-buttons');
        buttons.style.display = 'inline';

        var key = 'freeresponse-' + form.freeResponse;
        var stored = localStorage.getItem(key);
        if (stored !== null) {
            form.fieldContent.value = stored;
            form.gotValue = true;
        }
        form.defaultValue = form.fieldDefaultValue.value.toString();
        M.mod_oucontent.freeresponse.update_display(form);
    },

    // Used by freeresponse.submit() and freeresponse.submit_cell()
    submitFreeResponse : function (form) {
        var key = 'freeresponse-' + form.freeResponse;
        // Is it the same as the initial value?
        var current = form.fieldContent.value;
        if (current === form.defaultValue) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, current);
        }
        M.mod_oucontent.freeresponse.update_display(form);
    },

    // Used by freeresponse.reset_cell()
    resetFreeResponse : function (form) {
        var key = 'freeresponse-' + form.freeResponse;
        localStorage.removeItem(key);
        // singleform.fieldContent.value = form.defaultValue;
        M.mod_oucontent.freeresponse.update_display(form);
    },

    // Used by freeresponse.update_display()
    getExpectedLinkForDisplay : function (form) {
        return '\#' + form.freeResponse;
    }
}