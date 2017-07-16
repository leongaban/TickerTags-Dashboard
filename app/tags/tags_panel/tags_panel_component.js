////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagsPanel
 * @namespace Component
 * @desc The Component Controller for the tags tickers_panel
 */
import template from './tags_panel.html';
import TagsPanelController from './tags_panel_controller';

module.exports = angular
    .module('tickertags-tags')
    .component('tagsPanel', {
        template,
        controller: TagsPanelController,
        controllerAs: 'tags',
        bindings: {
            open: '<'
        }
    });