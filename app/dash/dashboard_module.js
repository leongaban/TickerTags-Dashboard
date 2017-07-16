////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-dashboard
* @namespace The module for Dashboard elements
* @desc Encapsulates the Dashboard related elements:
    - dashboardComponent
    - dashboardFactory
*/
const _tickertags_dash_module = angular.module('tickertags-dash', [])

require("./dashboard_factory");
require("./dashboard_component");

module.exports = _tickertags_dash_module;