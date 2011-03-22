/* ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is DomTemplate.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Joe Walker (jwalker@mozilla.com) (original author)
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


var settings = require("pilot/settings").settings;
var EventEmitter = require('./event_emitter').EventEmitter;

/**
 * Environment is an object that serves as a hub to an editors different
 * components. They can share share things in Unix ENV like way by setting
 * properties on environment and can communicate between each other using
 * events in a D-Bus like way.
 *
 * Also environment may have sub-environments, which are just an objects
 * that inherit from top / root environment. This way components can be shared
 * across multiple editor instances. All shared components will live have to
 * live in the parent environment and all the specific components in the
 * sub-environments. This way prototype chain will guarantee that parent env
 * will share it's state with it's sub-environments.
 * @returns {Environment}
 */
function Environment() {
  return Object.create(Environment.prototype, {
    settings: { value: settings, enumerable: true }
  });
};
Environment.prototype = Object.create(EventEmitter, {
  /**
   * Notifies all the listeners of the given event `type`. All the listeners
   * will be called with an `event` argument that will be extended with `env`
   * and `type` properties with value of the `env` on which event is emitted
   * and `type` of the event being emitted.
   * @param {String} type
   *    Event type
   * @param {Object} event
   *    Event being emitted.
   */
  emit: { value: function emit(type, event) {
        // Setting `this` pseudo variable as `env` property of emitted
        // event.
        event.env = this;
        this._emit(type, event);
    }, enumerable: true },
    /**
     * Retrieves environment variable with the given `name`.
     * @param {String} name
     *    Name of the property.
     */
    get: { value: function get(name) {
        return this[':' + name];
    }, enumerable: true },
    /**
     * Setting environment property with the given `name` and `value` and
     * emits `set` event on itself to notify all the observes.
     * @param {Object} variables
     *    Map of variable `name` -> `value` to be set in the environment.
     * @param {Object} options
     *    If object contains truthy property `silent` events won't be emitted.
     */
    set: { value: function set(variables, options) {
        Object.keys(variables).forEach(function(name) {
          var value = variables[name];
          var previous = this[':' + name];
          // Notifying all listeners that property was changed if value set is
          // different from existing value unless and `silent` option is `true`.
          if ((!options || !options.silent) && previous !== value) {
            var event = { name: name, value: value, previous: previous };
            this[':' + name] = value;
            this.emit('change', event);
            this.emit('change:' + name, event);
          }
        }, this);
    }, enumerable: true }
});
exports.Environment = Environment;

});
