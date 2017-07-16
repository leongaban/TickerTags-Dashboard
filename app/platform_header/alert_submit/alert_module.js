////////////////////////////////////////////////////////////////////////////////
/**
 * @name tickertags-alert
 * @namespace The Alert module
 * @desc Encapsulates the Alert related features
	- AlertsFactory
	- AlertSubmitFactory
 */

const _tickertags_alert_module = angular.module('tickertags-alert', []);

require('./alert_factory');
require('./alert_submit_factory');
require('./alert_submit_controller');

module.exports = _tickertags_alert_module;