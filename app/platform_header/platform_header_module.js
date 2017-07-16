////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-platform-header
* @namespace The Platform Header module
* @desc Encapsulates the Platform Header
	- platformHeaderComponent
	- userDropDownController
*/

const _tickertags_platform_header_module = angular.module('tickertags-platform-header', []);

require("./platform_header_component");
require("./user_drop_down_controller");

module.exports = _tickertags_platform_header_module;