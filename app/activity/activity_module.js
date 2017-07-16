////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-activity
* @namespace The module for Activity Panel
* @desc Encapsulates the ChartHeader, HighChart and SocialMedia scopes
*/

import ChartView from '../chart/chart_view.js'
import SocialView from '../social/social_media/social_media_view'

const _tickertags_activity_module = angular.module('tickertags-activity', ['ui.router'])
.config(['$stateProvider', function($stateProvider) {

    const activity = {
        name: 'container.dashboard.tickers.tags.activity',
        params: {
            ticker: '',
            term_id_1: null,
            term_id_2: null,
            term_id_3: null,
            social: 'frequency',
            stream: 'tweets'
        },
        resolve: {
            container: ['TagsContainer', '$stateParams', (TagsContainer, $stateParams) => {
                const terms = R.props(['term_id_1', 'term_id_2', 'term_id_3'], $stateParams);
                const allNull = R.all(R.isNil)(terms);
                const tags = allNull ? null : terms;
                return TagsContainer.get(tags);
            }]
        },
        views: {
            'chart@activity': ChartView,
            'social@activity': SocialView
        }
    };

    $stateProvider.state(activity);
}]);

require("./activity_component");

module.exports = _tickertags_activity_module;