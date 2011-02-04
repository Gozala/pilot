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
 * The Original Code is Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Kevin Dangoor (kdangoor@mozilla.com)
 *   Irakli Gozalishvili <rfobic@gmail.com> (http://jeditoolkit.com)
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

var EventEmitter = require("pilot/event_emitter").EventEmitter;

function PluginCatalog(plugins) {
    var catalog = Object.create(PluginCatalog.prototype, {
        plugins: { value: {}, enumerable: true },
        registry: { value: [] }
    });
    if (plugins) catalog.register(plugins);
    return catalog;
};
PluginCatalog.prototype = Object.create(EventEmitter, {
    constructor: { value: PluginCatalog },
    signal: { value: function signal(plugins, action) {
        var params = Array.prototype.slice.call(arguments, 2);

        plugins.forEach(function(plugin) {
            try {
                if (action in plugin) plugin[action].apply(plugin, params);
                this._emit(action, { plugin: plugin, data: params })
            } catch (exception) {
                this._emit("error", { action: action, plugin: plugin, error: exception })
            }
        }, this);
        return this;
    } },
    register: { value: function register(plugins) {
        plugins.forEach(function(plugin) {
            var name = plugin.name;
            if (!(name in this.plugins)) {
                this.registry.push(this.plugins[name] = plugin);
                this._emit("register", { plugin: plugin })
            }
        }, this);
        return this;
    }, enumerable: true },
    unregister: { value: function unregister(plugins) {
        plugins.forEach(function (plugin) {
            var name = 'string' === typeof plugin ? plugin : plugin.name;
            var plugin = this.plugins[name];
            var index = this.registry.indexOf(plugin);
            if (~index) this.registry.splice(index, 1);
            delete this.plugins[name];
            this._emit("unregister", { plugin: plugin })
        }, this);
        return this;
    },  enumerable: true },
    plug: { value: function plug(data, plugins) {
        if (plugins) this.register(plugins);
        else plugins = this.registry;

        return this.signal(plugins, "plug", data);
    }, enumerable: true },
    unplug: { value: function unplug(data, plugins) {
        return this.signal(plugins || this.registry, "unplug", data);
    }, enumerable: true }
});

exports.create = PluginCatalog;

});
