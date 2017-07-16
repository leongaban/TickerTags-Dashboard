module.exports = angular
    .module('tickertags-chart')
    .factory('ChartTicker', ChartTicker);

ChartTicker.$inject = [
    'ApiFactory',
    'Format',
    'ChartFactory'];

function ChartTicker(
    ApiFactory,
    Format,
    ChartFactory) {

    const renderSeries = (chart, series, data) => {
        // console.log(series, data.length);
        chart.get(series).setData(data, false);
        return chart;
    };

    const series = (chart, ticker, params, series) => {
        return ApiFactory.retrieveTickerPrice(ticker, { params }).then((res) => {
            return renderSeries(chart, series, Format.quotes(res));
        });
    };

    const getPrice = (chart, ticker, start, end) => {
        /* This function sets a new navigator range and sets the new chart viewport based on
         * the selected ticker 2 year period */
        const nav = Format.createStartEnd("max");
        const navSeries = series(chart, ticker, nav, 'highcharts-navigator-series');
        return navSeries.then(ChartFactory.updateViewPort(chart, start, end));
    };
    
    return {
        series,
        getPrice
    }
}