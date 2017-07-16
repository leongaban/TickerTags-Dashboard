////////////////////////////////////////////////////////////////////////////////
/**
 * @name ChartHeader
 * @namespace Component
 * @desc Displays Ticker details in the ChartHeader and hosts Chart options
 */
import template from './chart_header.html';
import ChartHeaderController from './chart_header_controller';

module.exports = angular
    .module('tickertags-chart')
    .component('chartHeader', {
        template,
        controller: ChartHeaderController,
        controllerAs: 'ch',
        bindings: {
            ticker: '<'
        }});

