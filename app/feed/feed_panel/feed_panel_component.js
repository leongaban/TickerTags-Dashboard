////////////////////////////////////////////////////////////////////////////////
/**
 * @name feedPanelComponent
 * @namespace Component
 * @desc Controls the Feed tickers_panel (Insight, Trend & Sentiment alerts)
 */
import template from './feed_panel.html'
import FeedPanelCtrl from './feed_panel_controller'

module.exports = angular
    .module('tickertags-feed')
    .filter('adminFeed', function () {
        return function(feed, isAdmin) {
            const status = isAdmin ? 0 : 1;
            return feed.filter(alert => alert.approved === status);
        }
    })
    .component('feedPanel', {
        template,
        controller: FeedPanelCtrl,
        controllerAs: 'fp',
        transclude: true,
        bindings: {
            // feedOpen: '<',
            // chartMax: '<'
        }
    });