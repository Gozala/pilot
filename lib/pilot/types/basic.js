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
  text: {
    toString: String,
    parse: function parse (value) {
      if (!isString(value))
        throw new Error('non-string passed to the text.parse()')

      return { value: value }
    }
  },
  /**
   * We don't currently plan to distinguish between integers and floats
   */
  number: {
    toString: function toString(value) {
      return (!value && 0 !== value) ? null : '' + value
    },
    parse: function parse(value) {
      var reply

      if (isString(value))
        throw new Error('non-string passed to number.parse()')

      var reply = {}
      if (0 === value.replace(/\s/g, '').length)
        reply.status = Status.INCOMPLETE
      else {
        reply.value = parseInt(value, 10)
        reply.status = Status.INVALID
        reply.message = 'Can\'t convert "' + value + '" to a number.'
      }

      return reply
    },
    decrement: function decrement(value) {
      return value - 1
    },
    increment: function increment(value) {
      return value + 1
    }
  },
  /**
   * One of a known set of options
   * SelectionType is a base class for other types
   */
  selection: {
    toString: String,
    parse: function parse(value) {
      var data, hasMatched, matchedValue, completions, message, result;

      if (isString(value))
        throw new Error('non-string passed to parse()')

      if (!this.data)
        throw new Error('Missing data on selection type extension.')

      data = isFunction(this.data) ? this.data() : this.data;

      // The matchedValue could be the boolean value false
      hasMatched = false
      completions = []
      result = {}

      data.forEach(function(option) {
        if (value === option) {
            matchedValue = this.fromString(option);
            hasMatched = true;
        } else if (option.indexOf(str) === 0) {
            completions.push(this.fromString(option))
        }
      }, this)

      if (hasMatched)
        result.value = matchedValue
      else {
        // This is something of a hack it basically allows us to tell the
        // setting type to forget its last setting hack.
        if (this.noMatch) this.noMatch();

        if (completions.length > 0) {
            result.message = 'Possibilities' +
                (value.length === 0 ? '' : ' for \'' + value + '\'');
            result.status = Status.INCOMPLETE
            result.suggestions = completions
        } else {
            result.message = 'Can\'t use \'' + value + '\'.';
            result.status = Status.INVALID
            result.suggestions = completions
        }
      }
    },
    fromString: function fromString(value) {
      return value
    },
    decrement: function decrement(value) {
      var index, data, name
      
      data = isFunction(this.data) ? this.data() : this.data
      if (null == value) index = data.length - 1
      else {
        name = this.toString(value)
        index = data.indexOf(name)
        index = index === 0 ? data.length - 1 : index - 1
      }

      return this.fromString(data[index])
    },
    increment: function increment(value) {
      var data, index, name

      data = isFunction(this.data) ? this.data() : this.data

      if (value == null) index = 0
      else {
        name = this.toString(value)
        index = data.indexOf(name)
        index = index === data.length - 1 ? 0 : index + 1
      }

      return this.fromString(data[index])
    }
  },
  /**
   * true/false values
   */
  bool: {
    base: 'selection',
    data: [ 'true', 'false' ],
    toString: String,
    fromString: function fromString(value) {
        return value === 'true' ? true : false
    }
  },
  /**
   * A set of objects of the same type
  */
  array: {
    toString: function toString(values) {
      // TODO: Check for strings with spaces and add quotes
      return values.join('\n')
    },
    parse: function parse(value) {

    }
  }
}

/**
 * A set of objects of the same type
 */
function ArrayType(typeSpec) {
    if (typeSpec instanceof Type) {
        this.subtype = typeSpec;
    }
    else if (typeof typeSpec === 'string') {
        this.subtype = types.getType(typeSpec);
        if (this.subtype == null) {
            throw new Error('Unknown array subtype: ' + typeSpec);
        }
    }
    else {
        throw new Error('Can\' handle array subtype');
    }
};

ArrayType.prototype.parse = function(value) {
    return this.defer().parse(value);
};

});
