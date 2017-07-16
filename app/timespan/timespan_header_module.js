////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-timespan-header
* @namespace The TimeSpan Header module
* @desc Encapsulates the TimeSpan Header
	- timespanHeaderComponent
	- timespan_granularity_component
*/

const _tickertags_timespan_header_module = angular.module('tickertags-timespan-header', []);

require("./timespan_header_component");
require("./granularity/timespan_granularity_component.js");

module.exports = _tickertags_timespan_header_module;