////////////////////////////////////////////////////////////////////////////////
/**
 * @name tickertags-settings
 * @namespace The Settings module
 * @desc Encapsulates settings states
	- settings.default
	- settings.alerts
 */

const _tickertags_settings_module = angular.module('tickertags-settings', []);

require("./default/settings_default_component");
require("./alerts/alert_settings_component");
require("./subscription/subscription_options.js");
require("./settings_component");

module.exports = _tickertags_settings_module;