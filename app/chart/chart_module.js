////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-chart
* @namespace The Chart module
* @desc Encapsulates the Chart related modules
    - chartConstants
    - chartConfig
    - chartExportFactory
    - chartExportComponent
    - chartFactory
    - chartTag (factory)
    - chartTicker (factory)
    - chartHeaderComponent
    - highChartComponent
    - tooltipFactory
*/

const _tickertags_chart_module = angular.module('tickertags-chart', ['highcharts-ng', 'ngCsv', 'ui.router']);

require("./chart_constants");
require("./highchart/chart_config");
require("./export/chart_export_factory");
require("./chart_factory");
require("./highchart/chart_tag");
require("./highchart/chart_ticker");
require("./header/chart_header_component");
require("./header/chart_header_controller");
require("./highchart/high_chart_component");
require("./highchart/tooltip_factory");

module.exports = _tickertags_chart_module;