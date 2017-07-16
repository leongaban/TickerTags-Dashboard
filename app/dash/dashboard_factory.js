/**
 * @name Dashboard
 * @namespace Factories
 * @desc Manages the state of the app
 */

module.exports = angular
    .module('tickertags-dash')
    .factory('Dashboard', factory);

factory.$inject = [];

function factory() {

    const state = {
        social: 'tweets'
    };

    const previous = {
        state: {}
    };

    const getDefaultState = () => {
        const timespan    = 'day';
        const group       = 'hour';
        const sort        = 'trend';
        const end_epoch   = moment(moment.now()).unix();
        const start_epoch = moment(moment.now()).subtract(1, 'day').unix();
        return {
            ticker: 'SPY',
            portfolio: null,
            timespan,
            group,
            sort,
            start_epoch,
            end_epoch,
            tags_open: true,
            feed_open: true,
            chart_alerts: true,
            chart_max: false,
            links: false,
            retweets: false
        }
    };

    const set = (component, value) => state[component] = value;
    const get = (component) => state[component];
    const panelStatus = (tagsOpen, chartMax) => tagsOpen && !chartMax;
    const savePreviousState = (params) => params !== {} ? previous.state = params : null;
    const getPreviousState = () => R.isEmpty(previous.state) ? getDefaultState() : previous.state;

    return {
        state,
        previous,
        set,
        get,
        panelStatus,
        savePreviousState,
        getPreviousState,
        getDefaultState
    }
}