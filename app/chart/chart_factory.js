////////////////////////////////////////////////////////////////////////////////
/**
* @name ChartFactory
* @namespace Factories
* @desc Provides value storage and logic help for Chart related tasks
*/

module.exports = angular
    .module('tickertags-chart')
    .factory('ChartFactory', factory);

factory.$inject = [
    'Format'];

function factory(
    Format) {

    //////////////////////////////////////////////////////////////////////////
    const toMilliseconds = Format.toMilliseconds;
    let RANGE_TYPE = 'incidences';
    let DATA_TYPE = 'tweets';
    let TICKER = '';
    let GRANULARITY_REQUESTED = false;

    const extremes = {
        start : 0,
        end   : 0
    };

    const alertExtremes = {
        start : 0,
        end   : 0
    };

    const toolTipPoints = {
        x : 0,
        price : 0,
        tag1 : 0,
        tag2 : 0,
        tag3 : 0,
        positive : 0,
        negative : 0,
        alert : 0
    };

    // Function expressions ////////////////////////////////////////////////////
    const updateToolTipPoints = (series, yPointData, xPoint) => {
        switch(series) {
            case 'price'    : toolTipPoints.price    = yPointData; toolTipPoints.x = xPoint; break;
            case 'tag1'     : toolTipPoints.tag1     = yPointData; break;
            case 'tag2'     : toolTipPoints.tag2     = yPointData; break;
            case 'tag3'     : toolTipPoints.tag3     = yPointData; break;
            case 'positive' : toolTipPoints.positive = yPointData; break;
            case 'negative' : toolTipPoints.negative = yPointData; break;
            case 'alert'    : toolTipPoints.alert    = yPointData; break;
        }

        return toolTipPoints;
    };

    const saveTicker = (tick) => TICKER = tick;

    const getTicker = () => TICKER;

    const rangeType = (type = 'incidences') => {
        if (type === 'frequency') type = 'incidences';
        RANGE_TYPE = type;
    };

    const getRangeType = () => RANGE_TYPE;

    const setDataType = (type = 'tweets') => DATA_TYPE = type;

    const getDataType = () => DATA_TYPE;

    const saveExtremes = (start, end) => {
        extremes.start = start;
        extremes.end   = end;
    };

    const getExtremes = () => extremes;

    const setAlertExtremes = (start, end) => {
        alertExtremes.start = start;
        alertExtremes.end   = end;
    };

    const getAlertExtremes = () => alertExtremes;

    const hideChartLoading = (chart) => chart.hideLoading();

    const renderChart = _.debounce((chart) => {
        chart.redraw();
        return Promise.resolve(chart)}, 300
    );

    const updateViewPort = (chart, start, end) => {
        chart.get('x-axis-priceline').setExtremes(toMilliseconds(start), toMilliseconds(end), false);
        chart.get('x-axis-sentiment').setExtremes(toMilliseconds(start), toMilliseconds(end), false);
        chart.get('x-axis-alert').setExtremes(toMilliseconds(start), toMilliseconds(end), false);
        // return renderChart(chart);
        chart.redraw();
        return chart;
    };

    const changingGranularity = (bool) => GRANULARITY_REQUESTED = bool;

    const getGranularity = () => GRANULARITY_REQUESTED;

    return {
        // variables
        GRANULARITY_REQUESTED,
        alertExtremes,
        toolTipPoints,
        // functions
        changingGranularity,
        getGranularity,
        updateViewPort,
        renderChart,
        hideChartLoading,
        updateToolTipPoints,
        saveTicker,
        getTicker,
        rangeType,
        getRangeType,
        getDataType,
        setDataType,
        saveExtremes,
        getExtremes,
        setAlertExtremes,
        getAlertExtremes
    };
}