////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags_auth
* @namespace The Authentication module
* @desc Encapsulates the Authentication related modules
    - AUTH_EVENTS
    - UserRoles
    - AuthFactory
    - AuthInterceptor
    - AuthResolver
    - emailLinkFactory
    - createPasswordController
    - loginController
    - passResetController
*/

const _tickertags_auth_module = angular.module('tickertags-auth', []);

require("../constant/auth_events");
require("../constant/user_roles");
require("../session/session_service");
require("../session/settings_service");
require("./auth_factory");
require("./create_password_controller");
require("./interceptor_factory");
require("./password_reset_controller");
require("./resolver_factory");

module.exports = _tickertags_auth_module;