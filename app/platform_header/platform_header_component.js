////////////////////////////////////////////////////////////////////////////////
/**
 * @name platformHeaderComponent
 * @namespace Component
 * @desc The Platform header: Logo, timerange, setChartRange, UserSettings
 */
import template from './platform_header.html';
import PlatformCtrl from './platform_header_controller';

module.exports = angular
    .module('tickertags-platform-header')
    .component('platformHeader', {
        template,
        controller: PlatformCtrl,
        controllerAs: 'ph',
        bindings:{
            container: '<'
        }
    });