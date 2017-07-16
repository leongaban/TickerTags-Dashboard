////////////////////////////////////////////////////////////////////////////////
/**
 * @name view_header_component
 * @namespace Component
 * @desc Component and Controller for the viewHeader
 */
import template from './view_header.html'
import ViewHeaderController from './view_header_controller'

module.exports = angular
    .module('tickertags-view-header')
    .component('viewHeader', {
        template,
        bindings: {
        	container: '<'
        },
        controller: ViewHeaderController,
        controllerAs: 'vh'
    });