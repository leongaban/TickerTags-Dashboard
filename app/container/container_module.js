////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-container
* @namespace The module for Container State
*/
import querystring from 'query-string'
import analyticsTemplate from '../analytics/analytics.html'
import analyticsController from '../analytics/analytics_controller'
import dashboardTemplate from '../dash/dashboard.html'
import settingsTemplate from '../settings/settings_container.html'
import settingsDefaultTemplate from '../settings/default/settings_default_container.html'
import settingsAlertsTemplate from '../settings/alerts/alert_settings_container.html'
import SettingsDefaultCtrl from '../settings/default/settings_default_controller'
import renewTemplate from '../settings/renew/renew.html'
import renewController from '../settings/renew/renew_controller'

const _tickertags_container_module = angular.module('tickertags-container', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
    const timespan    = 'day';
    const group       = 'hour';
    const end_epoch   = moment(moment.now()).unix();
    const start_epoch = moment(moment.now()).subtract(1, 'day').unix();
    const hash = window.location.hash;
    const query = hash.indexOf('?');
    const redirect = query > 0 ? Array.from(hash).slice(query).join('') : '';

    const container = {
        name: 'container',
        url:'/ticker/tags',
        params: {
            tags_open: true,
            feed_open: false,
            chart_alerts: true,
            chart_max: false
        },
        template: `<div ui-view></div>`,
        controller: ['$cookies','$state', 'user', 'Util', ($cookies, $state, user, Util) => {
            // if refresh is not empty call with values
            const refresh =  $cookies.getObject('tickertags');
            const isRedirect = !!redirect;
            const redirection = Util.queryStringBooleans(querystring.parse(redirect));
            const parameters = isRedirect ? redirection : refresh;
            // if (user.isAdmin) { parameters.feed_open = true; }
            $state.go('container.dashboard.tickers.tags.activity', parameters);
        }],
        resolve: {
            user: (AuthFactory) => AuthFactory.check_login(),
        }
    };

    const dashboard = {
        name: 'container.dashboard',
        params: {
            ticker: 'SPY',
            portfolio: null,
            start_epoch: start_epoch,
            end_epoch: end_epoch,
            group: group,
            timespan,
            sort: 'trend',
            links: false,
            retweets: false
        },
        template: dashboardTemplate,
        controller: [
            '$state', 'portfolio_tickers', 'UserFactory', 'user',
            ($state, portfolio_tickers, UserFactory, user) => {
                UserFactory.storeUser(user);
            }
        ],
        resolve: {
            user: (AuthFactory) => AuthFactory.check_login(),
            settings: (user, UserFactory) => UserFactory.settings(user),
            portfolio_tickers: (TickersFactory) => TickersFactory.loadAllPortfolios(),
            group: ($stateParams) => {
                if (R.not(R.is(String, $stateParams.group))) {
                    throw new Error('Group param is not string');
                }
                return $stateParams.group;
            }
        }
    };

    const analytics = {
        name: 'container.analytics',
        url: '/analytics',
        params: {
            ticker: 'SPY'
        },
        resolve: {
            ticker: ['$stateParams', function($stateParams) {
                return $stateParams.ticker;
            }]
        },
        template: analyticsTemplate,
        controllerAs: 'ac',
        controller: analyticsController
    };

    const settings = {
        abstract: true,
        name: 'settings',
        url: '/settings',
        params: {
            default: true
        },
        resolve: {
            user: (AuthFactory) => AuthFactory.check_login(),
            settings: (user, UserFactory) => UserFactory.settings(user).catch((e) => console.log(e))
        },
        template: settingsTemplate
    };

    const settingsDefault = {
        name: 'settings.default',
        url: '/default',
        parent: 'settings'
    };

    const settingsAlerts = {
        name: 'settings.alerts',
        url: '/alerts',
        parent: 'settings',
        template: settingsAlertsTemplate
    };

    const renew = {
        name: 'renew',
        url: '/renew',
        template: renewTemplate,
        resolve: {
            user: (AuthFactory) => AuthFactory.check_login(),
        },
        controller: renewController
    };

    $stateProvider
        .state(container)
        .state(analytics)
        .state(dashboard)
        .state(settings)
        .state(settingsDefault)
        .state(settingsAlerts)
        .state(renew);
}]);

module.exports = _tickertags_container_module;