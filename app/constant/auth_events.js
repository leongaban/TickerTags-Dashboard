/**
 * Created by paulo on 10/20/16.
 */
module.exports = angular.module('tickertags-auth')
    .constant('AUTH_EVENTS', {
    loginSuccess     : 'auth-login-success',
    loginFailed      : 'auth-login-failed',
    logoutSuccess    : 'auth-logout-success',
    sessionTimeout   : 'auth-session-timeout',
    notAuthenticated : 'auth-not-authenticated',
    notAuthorized    : 'auth-not-authorized'
});
