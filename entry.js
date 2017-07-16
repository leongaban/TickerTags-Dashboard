const _tickertags                        = require("./app/app");
const _tickertags_container_module       = require("./app/container/container_module");
const _tickertags_alert_module           = require("./app/platform_header/alert_submit/alert_module");
const _tickertags_auth_module            = require("./app/auth/authentication_module");
const _tickertags_chart_module           = require("./app/chart/chart_module");
const _tickertags_config_module          = require("./app/config/config_module");
const _tickertags_dash_module            = require("./app/dash/dashboard_module");
const _tickertags_feed_module            = require("./app/feed/feed_module");
const _tickertags_timespan_header_module = require("./app/timespan/timespan_header_module");
const _tickertags_platform_header_module = require("./app/platform_header/platform_header_module");
const _tickertags_view_header_module     = require("./app/view_header/view_header_module");
const _tickertags_tags_module            = require("./app/tags/tags_module");
const _tickertags_activity_module        = require("./app/activity/activity_module");
const _tickertags_tickers_module         = require("./app/tickers/tickers_module");
const _tickertags_search_module          = require("./app/search/search_module");
const _tickertags_shared_module          = require("./app/shared/shared_module");
const _tickertags_social_module          = require("./app/social/social_media_module");
const _tickertags_settings_module        = require("./app/settings/settings_module");
const _tickertags_subscription_module    = require("./app/subscription/subscription_module");
const papagaioComponent                  = require("./app/shared/papagaio/papagaio_component");

/**
 * TickerTags Webpack module loader for the Dashboard
 * @desc Webpack entry file, bundles all Angular modules together.
 */

/** ----------------------------------------------------------------------------
 ============================================================================= */