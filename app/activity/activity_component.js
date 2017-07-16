////////////////////////////////////////////////////////////////////////////////
/**
 * @name activityPanel
 * @namespace Component
 * @desc The Component Controller for the tags tickers_panel
 */
import template from './activity_panel.html'
import ActivityPanelController from './activity_panel_controller'

module.exports = angular
    .module('tickertags-activity')
    .component('activityPanel', {
        template,
        controllerAs: 'activity',
        controller: ActivityPanelController,
        bindings: {
            ticker: '<'
        }
    });