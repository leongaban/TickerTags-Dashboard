////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-search
* @namespace The Search module
* @desc Encapsulates the Search related modules
	- searchFactory
	- searchComponent
	    - focusMeDirectives
*/

const _tickertags_search_module = angular.module('tickertags-search', []);

require("./search_factory");
require("./search_component");
require("./focus_me_directive");

module.exports = _tickertags_search_module;