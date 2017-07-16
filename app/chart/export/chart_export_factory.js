////////////////////////////////////////////////////////////////////////////////
/**
* @name ChartExportFactory
* @namespace Factory
* @desc Export Chart screenshots and CSV / XLS charts using export-csv
* http://www.highcharts.com/plugin-registry/single/7/Export%20Data
*/

import exportModal from './chart_export_modal';

const chartExportFactory = angular
    .module('tickertags-chart')
    .factory('ChartExport', ChartExport);

ChartExport.$inject = [
    '$state',
    '$uibModal',
    'Format',
    'Util'];

function ChartExport(
    $state,
    $uibModal,
    Format,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    let SAVED_CHART = {};
    const storeChart = (chart) => SAVED_CHART = chart;
    const getChart = () => SAVED_CHART;

    const display = () => {
        $uibModal.open(exportModal);
    };

    const determineGranularity = (timespan) => {
        switch(timespan) {
            case 'hour':
                return 'minute';
            case 'day':
                return 'hour';
            case 'week':
            case 'month':
            case '3month':
            case 'year':
            case '2year':
            case 'max':
                return 'week';
        }
    };

    const getGroupingSize = (timespan) => {
        switch(timespan) {
            case 'hour'   : return 'minute';
            case 'day'    : return 'small';
            case 'week'   : return 'medium';
            case 'month'  : return 'large';
            case '3month' : return 'large';
            case 'year'   : return 'large';
            case '2year'  : return 'large';
            case 'max'    : return 'large';
        }
    };

    const determineDateFormat = (granularity) => {
        switch(granularity) {
            case 'minute':
            case 'hour': return '%I:%M %P';
            case 'day':  return '%m-%d-%Y';
            case 'week': return '%m-%d-%Y';
        }
    };

    const createFileName = (chart) => {
        const price = chart.get('series-priceline');
        const timespan = $state.params.timespan === 'year' ? '1year' : $state.params.timespan;
        chart.options.exporting.filename = `${price.name} ${timespan}`;
        return chart;
    };

    const setDateFormat = (chart) => {
        const granularity = R.isNil($state.params.group) ? determineGranularity($state.params.timespan) : $state.params.group;
        chart.options.exporting.csv.dateFormat = determineDateFormat(granularity);
        return chart;
    };

    const removeTagSeries = (chart, num) => {
        chart.get(`tag_frequency_${num}`).remove();
        chart.get(`tag_mentions_${num}`).remove();
        return chart;
    };

    const removeSentimentSeries = (chart) => {
        chart.get('x-axis-sentiment').remove();
        chart.get('y-axis-sentiment').remove();
        return chart;
    };

    const removeEmptySeries = (chart, tag0, tag1, tag2, stream) => {
        chart = tag0 && R.isEmpty(tag0.data) ? removeTagSeries(chart, 0) : chart;
        chart = tag1 && R.isEmpty(tag1.data) ? removeTagSeries(chart, 1) : chart;
        chart = tag2 && R.isEmpty(tag2.data) ? removeTagSeries(chart, 2) : chart;
        chart = R.not(R.equals(stream, 'tweets')) ? removeSentimentSeries(chart) : chart;
        return chart;
    };

    const renameSentimentColumns = (chart) => {
        chart.get('series-positive').name = 'Positive Sentiment';
        chart.get('series-negative').name = 'Negative Sentiment';
        return chart;
    };

    const getDataType = (isFrequency) => isFrequency ? 'frequency' : 'mentions';

    const changeName = (chart, tagNumber, isFrequency) => {
        const tagSeries = isFrequency ? `tag_frequency_${tagNumber}` : `tag_mentions_${tagNumber}`;
        const dataType = getDataType(isFrequency);
        const seriesName = Format.removeQuotes(chart.get(tagSeries).name);
        chart.get(tagSeries).name = `${seriesName} (${dataType})`;
        chart.columnNames.push({ tag: seriesName });
        return chart;
    };

    const updateTagColumnNames = (chart, term1 = null, term2 = null, term3 = null, isFrequency = true) => {
        chart.columnNames = [];
        chart = R.isNil(term1) ? chart : changeName(chart, 0, isFrequency);
        chart = R.isNil(term2) ? chart : changeName(chart, 1, isFrequency);
        chart = R.isNil(term3) ? chart : changeName(chart, 2, isFrequency);
        return chart;
    };

    const attachTagNames = (chart, term1 = null, term2 = null, term3 = null, isFrequency, stream) => {
        const tag = { names: '' };
        const dataType = getDataType(isFrequency);
        tag.names = R.isNil(term1) ? tag.names : `${tag.names} ${chart.columnNames[0].tag}`;
        tag.names = R.isNil(term2) ? tag.names : `${tag.names} ${chart.columnNames[1].tag}`;
        tag.names = R.isNil(term3) ? tag.names : `${tag.names} ${chart.columnNames[2].tag}`;
        return `${tag.names} ${dataType} ${stream}`;
    };

    const updatePriceLine = (chart) => {
        const prices = chart.get('series-priceline').data.map(point => {
            return {
                x: point.x,
                y: point.y
            };
        });

        chart.get('series-priceline').update({ keys: ['y'] });
        chart.get('series-priceline').setData(prices);
        return chart;
    };

    const floorY = (point) => {
        point.y = Util.floor(point.y);
        return point;
    };

    const floorMentions = (data) => R.map(floorY, data);

    const formatTagData = (chart, tag0, tag1, tag2) => {
        if (tag0) {
            if (R.not(R.isEmpty(tag0.data))) tag0.points = floorMentions(tag0.points);
        }

        if (tag1) {
            if (R.not(R.isEmpty(tag1.data))) tag1.points = floorMentions(tag1.points);
        }

        if (tag2) {
            if (R.not(R.isEmpty(tag2.data))) tag2.points = floorMentions(tag2.points);
        }

        return chart;
    };

    const formatAlerts = (chart) => {
        const alertPoints = chart.get('series-alert').data.map(point => {
            return {
                x: point.x,
                y: 1
            };
        });

        chart.get('series-alert').setData(alertPoints);
        return chart;
    };

    return {
        storeChart,
        getChart,
        display,
        determineGranularity,
        getGroupingSize,
        createFileName,
        setDateFormat,
        renameSentimentColumns,
        formatTagData,
        formatAlerts,
        updateTagColumnNames,
        removeEmptySeries,
        attachTagNames,
        updatePriceLine
    }
}

module.exports = chartExportFactory;