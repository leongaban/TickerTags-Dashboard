////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-shared
* @namespace The module for shared helpers
* @desc Encapsulates the shared Helper modules
*/
import Formatter from './formatter';

const _tickertags_shared_module = angular.module('tickertags-shared', [])
    .factory('Format', Formatter);

require("./api_factory");
// require("./cookies_factory");
require("../constant/websocket_constants");
require("../constant/time_constants");
require("../constant/z_index");
require("./capitalize_filter");
require("./constant");
require("./message/message_factory");
require("./mouse_position_factory");
require("./state_go_factory.js");
require("./sizing_factory");
require("./time_span_factory");
require("./unread_notifications");
require("./user_factory.js");
require("./utility");
require("./volume_factory");

module.exports = _tickertags_shared_module;