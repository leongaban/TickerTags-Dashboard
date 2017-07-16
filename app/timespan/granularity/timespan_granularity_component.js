////////////////////////////////////////////////////////////////////////////////
/**
 * @name granularity
 * @namespace Component
 * @desc The Component and Controller for the timespan granularity
 */
import template from './timespan_granularity.html'
import TimespanGranularityComponent from './timespan_granularity_controller'

module.exports = angular
    .module('tickertags-timespan-header')
    .component('granularity', {
        template,
        controller: TimespanGranularityComponent,
        controllerAs: 'tst',
        require: {
            timespanHeader: '^timeSpanHeader'
        }
    });
