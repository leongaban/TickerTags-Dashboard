////////////////////////////////////////////////////////////////////////////////
/**
 * @name timespan_header_component
 * @namespace Component
 * @desc Component and Controller for the timespanHeader
 */
import template from './timespan_header.html'
import TimeSpanHeaderController from './timespan_header_controller'

module.exports = angular
    .module('tickertags-timespan-header')
    .component('timeSpanHeader', {
        template,
        controller: TimeSpanHeaderController,
        controllerAs: 'thc',
        bindings: {
            onPortfolioUpdate: '&'
        }
    });