////////////////////////////////////////////////////////////////////////////////
/**
 * @name ViewFactory
 * @namespace Factories
 * @desc Stores and retrieves the users workspace and ticker tag combinations
 */

module.exports = angular
    .module('tickertags-view-header')
    .factory('ViewFactory', factory);

factory.$inject = [
    '$cookies',
    '$httpParamSerializer',
    '$location',
    'ApiFactory',
    'State',
    'Util'];

function factory(
    $cookies,
    $httpParamSerializer,
    $location,
    ApiFactory,
    State,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const savedViews = { that: this };

    const notValid = (name) => R.or(R.isNil(name), R.isEmpty(name));

    const valid = R.complement(notValid);

    const createShareUrl = (stateParams) => {
        const allParams = R.filter(Util.notEmpty, stateParams);
        const params = R.dissoc('portfolio', allParams);
        params.favorite = 0;
        params.private  = 0;
        const url = `${$location.$$absUrl}?${$httpParamSerializer(params)}`;
        return url;
    };

    const storeSavedViews = (data) => savedViews.that = data;

    const retrieveSavedViews = () => savedViews.that;

    const endEpochFix = (view) => {
        if (view.end_epoch === null && view.timespan === 'max') {
            view.end_epoch = Math.floor(new Date().getTime() / 1000);
        }
        return view;
    };

    const formatViews = (savedViews) => {
        const clonedViews = R.clone(savedViews);
        return R.map(endEpochFix, clonedViews);
    };

    const viewDelete = (current) => ApiFactory.deleteView(current.id);

    const submitView = (viewName) => {
        const stateCookie = $cookies.get('tickertags');
        const viewObject = JSON.parse(stateCookie);
        viewObject.description = viewName;
        return ApiFactory.saveView(viewObject);
    };

    const saveView = (name) => submitView(name);

    const renderViewinUI = (ticker, terms, timespan, start_epoch, end_epoch) => {
        State.go('.tickers.tags.activity', {
            ticker,
            term_id_1: terms[0],
            term_id_2: terms[1],
            term_id_3: terms[2],
            timespan,
            start_epoch,
            end_epoch
        });
    };

    const loadView = (view) => {
        const terms = [];
        const ticker = R.isEmpty(view.ticker) ? view.ticker_1 : view.ticker;
        const timespan = view.timespan;
        const start_epoch = view.start_epoch;
        const end_epoch = view.end_epoch;

        if (view.term_id_1) terms.push(view.term_id_1);
        if (view.term_id_2) terms.push(view.term_id_2);
        if (view.term_id_3) terms.push(view.term_id_3);

        return renderViewinUI(ticker, terms, timespan, start_epoch, end_epoch);
    };

    return {
        valid,
        createShareUrl,
        storeSavedViews,
        retrieveSavedViews,
        formatViews,
        saveView,
        loadView,
        viewDelete
    }
}