//@flow
/** ============================================================================
----------------------------------------------------------------------------- */

/**
 * Main TickerTags app.js
 * @namespace Module
 * @desc The main app file
 * @summary "All change is detectable."
 * @authors Leon Gaban & Paulo DaRocha
 * @copyright TickerTags 2017
 */

/** ----------------------------------------------------------------------------
============================================================================= */
import loginTemplate from './auth/login.html'
import loginController from './auth/login_controller'
import passwordResetTemplate from './auth/password_reset.html'
import { subscription, customer, payment } from './subscription/subscription_routing.js'
import AppRun from './run'

"use strict";
module.exports = angular.module('tickertags', [
    'tickertags-alert',           // alerts / alertsModule.js
    'tickertags-auth',            // authentication / authentication_module.js
    'tickertags-container',       // container / container_module.js
    'tickertags-chart',           // chart / chart_module.js
    'tickertags-config',          // config constants
    'tickertags-dash',            // dash / dashboard_module.js
    'tickertags-activity',        // chart, chartHeader, socialMedia
    'tickertags-feed',            // feed / feed_module.js
    'tickertags-timespan-header', // timespan_header_module.js
    'tickertags-platform-header', // platform_header_module.js
    'tickertags-view-header',     // view_header
    'tickertags-search',          // search / search_module.js
    'tickertags-shared',          // shared / shared_module.js
    'tickertags-social',          // socialMedia / social_media_module.js
    'tickertags-settings',        // settings
    'tickertags-tags',            // tags / tags_module.js
    'tickertags-tickers',         // tickers / tickers_module.js
    'tickertags-subscription',    // subscription / subscription_module.js
    'ngCookies',
    'ui.mask',                    // https://github.com/angular-ui/ui-mask
    'ui.router',                  // https://github.com/angular-ui/ui-router
    'ui.bootstrap',               // https://github.com/angular-ui/bootstrap,
])

.config([
    '$stateProvider',
    '$urlRouterProvider',
    function(
        $stateProvider,
        $urlRouterProvider) {

    const hash = window.location.hash;
    const query = hash.indexOf('?');
    const redirect = query > 0 ? Array.from(hash).slice(query).join('') : '';

    $urlRouterProvider.otherwise('/login');

    const login = {
        name: 'login',
        url: '/login',
        template: loginTemplate,
        controller: loginController,
        controllerAs: 'lg',
        data: {
            redirect: redirect,
            authorizedRoles: ['All']
        }
    };

    const passwordreset = {
        name: 'passwordreset',
        url: '/passwordreset',
        template: passwordResetTemplate,
        controller: 'PassResetCtrl',
        data: { authorizedRoles: ['All'] }
    };

    $stateProvider
        .state(login)
        .state(passwordreset)
        .state(subscription)
        .state(customer)
        .state(payment)
}])

.config(['$httpProvider', function($httpProvider) {
    // Comment out before production:
    // Dev database:
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.interceptors.push(['$injector', ($injector) => {
        return $injector.get('AuthInterceptor');
    }]);
}])

.run(AppRun);