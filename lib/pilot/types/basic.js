/* vim:ts=4:sts=4:sw=4:
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Joe Walker (jwalker@mozilla.com)
 *      Kevin Dangoor (kdangoor@mozilla.com)
 *      Irakli Gozalishvili <rfobic@gmail.com> (http://jeditoolkit.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

function isString(value) {
  return 'string' === typeof value
}

function isFunction(value) {
  return 'function' === typeof value
}

/**
 * These are the basic types that we accept. They are vaguely based on the
 * Jetpack settings system (https://wiki.mozilla.org/Labs/Jetpack/JEP/24)
 * although clearly more restricted.
 *
 * <p>In addition to these types, Jetpack also accepts range, member, password
 * that we are thinking of adding.
 *
 * <p>This module probably should not be accessed directly, but instead used
 * through types.js
 */


exports.types = {
    /**
     * 'text' is the default if no type is given.
     */
    text: function text(input) {
        return isString(input) ? [input] : [];
    },
    /**
     * We don't currently plan to distinguish between integers and floats
     */
    number: {
        suggest: function suggest(input) {
            var value = parseFloat(String(input).replace(/\s/g, ''));
            return isNaN(value) ? [] : [value];
        },
        decrement: function decrement(input) {
            return input - 1;
        },
        increment: function increment(input) {
            return input + 1;
        }
    },
    bool: {
        "true": true,
        "false": false
    }
};

});
