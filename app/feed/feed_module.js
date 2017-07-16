////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-feed
* @namespace The Alerts Feed module
* @desc Encapsulates the Alert Feed related modules
    - feedFactory
    - feedPanelDirective
    - feedSettingsFactory
    - bad_alert_controller
    - bad_alert_deny_factory
    - thumbs_up_controller
    - thumbs_up_factory
*/

const _tickertags_feed_module = angular.module('tickertags-feed', ['ngWebSocket']);

require("./feed_factory");
require("./filter");
require("./feed_panel/feed_panel_component");
require("./feed_panel/feed_panel_controller");
require("./settings/feed_settings_factory");
require("./modals/alert_deny_factory");
require("./modals/alert_approve_factory");

module.exports = _tickertags_feed_module;