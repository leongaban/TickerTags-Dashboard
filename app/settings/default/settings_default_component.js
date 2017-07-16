////////////////////////////////////////////////////////////////////////////////
/**
 * @name settingsDefaultComponent
 * @namespace Controller
 * @desc Controller for the Settings.default scope
 */
import template from './settings_default.html';
import SettingsDefaultCtrl from './settings_default_controller';

module.exports = angular
    .module('tickertags-settings')
    .component('settingsDefaultComponent', {
        template,
        controller: SettingsDefaultCtrl,
        controllerAs: "std",
        transclude: true
    });