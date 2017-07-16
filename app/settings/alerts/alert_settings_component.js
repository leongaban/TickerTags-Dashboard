////////////////////////////////////////////////////////////////////////////////
/**
 * @name settingsAlertsComponent
 * @namespace Controller
 * @desc Controller for the Settings.alert scope
 */
import template from './alert_settings.html';
import AlertSettingsController from './alert_settings_controller';

module.exports = angular
    .module('tickertags-settings')
    .component('settingsAlertsComponent', {
        template,
        controller: AlertSettingsController,
        controllerAs: "sta",
        transclude: true
    });