////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-view-header
* @namespace The View Header module
* @desc Encapsulates the View UI refresh URL related modules
	- viewFactory
	- viewHeader
	- view_save_load_component
*/

const _tickertags_view_header_module = angular.module('tickertags-view-header', []);

require("./view_factory");
require("./view_header_component");
require("./view_save_load_component");

module.exports = _tickertags_view_header_module;