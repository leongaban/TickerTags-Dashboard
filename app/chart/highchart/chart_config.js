////////////////////////////////////////////////////////////////////////////////
/**
* @name ChartConfig
* @namespace Factories
* @desc Provides the models for the HighCharts config objects
*/

module.exports = angular
    .module('tickertags-chart')
    .factory('ChartConfig', factory);

factory.$inject = [
	'CHART',
	'Tooltip',
	'zIndex'];

function factory(
	CHART,
	Tooltip,
	zIndex) {

    ////////////////////////////////////////////////////////////////////////////
    // Create week dateFormat
    // http://api.highcharts.com/highcharts/Highcharts.dateFormats
    Highcharts.dateFormats = {
        W: function (timestamp) {
            var date = new Date(timestamp),
                day = date.getUTCDay() === 0 ? 7 : date.getUTCDay(),
                dayNumber;
            date.setDate(date.getUTCDate() + 4 - day);
            dayNumber = Math.floor((date.getTime() - new Date(date.getUTCFullYear(), 0, 1, -6)) / 86400000);
            return 1 + Math.floor(dayNumber / 7);
        }
    };

	const lookupColors = ["#FDE18D", "#7DD0FA", "#58A6EC"];

	const options = {
        global: { useUTC : false },
        chart: {
            backgroundColor: '#474747',
            title: { text: null },
            subtitle: { text: null },
            renderTo: 'highchart-element',
            zoomType: 'x'
        },
        ignoreHiddenSeries: false,
        credits: { enabled: true, text: 'tickertags.com' },
        legend: {
            itemStyle: { color: "#fff", cursor: "pointer", fontSize: "10px", fontWeight: "normal" },
            floating: true,
            align: 'left',
            verticalAlign: 'top',
            x: 60,
            y: 0
        },
        scrollbar: { enabled: false, liveRedraw: false },
        navigator: {
            enabled: true,
            baseSeries: 'series-priceline',
            adaptToUpdatedData: false,
            series: {
                includeInCSVExport: false,
                data: []
            }
        },
        rangeSelector: { enabled: false, },
        tooltip: {
            headerFormat: `<span style="color:whitesmoke;"">Current interval: </span><br/>`,
            shared: true,
            useHTML: true,
            backgroundColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 0,
            shadow: false,
            style: { opacity: 1 }
        },
        exporting: {
            allowHTML: true,
            enabled: false,
            sourceWidth: 720,
            sourceHeight: 280,
            csv: {
                dateFormat: '%Y-%m-%d'
            },
            chartOptions: {
                title: {
                    text: null
                },
                navigator: {
                    enabled: false
                }
            }
        },
        plotOptions: {
            series: {
                turboThreshold: 0,
                marker: { enabled: false },
                events: {}
            },
            area: { stacking: 'normal' },
            column: {
                stacking: 'normal',
                borderWidth: 0
            }
        },
        useHighStocks: true,
        xAxis: [],
        yAxis: [],
        series: []
    };

    const priceLine = {
        id: 'series-priceline',
        xAxis: CHART.axis.default,
        name: 'price',
        keys: ['x', 'y', 'end'],
        // keys: ['start', 'price', 'end'],
        lineWidth: 3,
        showInLegend: false,
        zIndex: zIndex.series.priceline,
        color: '#4C73FF',
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.priceline }
    };

    const tag0_frequency = {
        id: 'tag_frequency_0',
        name: 'tag_frequency_0',
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[0],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const tag1_frequency = {
        id: 'tag_frequency_1',
        name: 'tag_frequency_1',
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[1],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const tag2_frequency = {
        id: 'tag_frequency_2',
        name: 'tag_frequency_2',
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[2],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const tag0_mentions = {
        id: 'tag_mentions_0',
        name: 'tag_mentions_0',
        // enabled: false,
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[0],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const tag1_mentions = {
        id: 'tag_mentions_1',
        name: 'tag_mentions_1',
        // enabled: false,
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[1],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const tag2_mentions = {
        id: 'tag_mentions_2',
        name: 'tag_mentions_2',
        // enabled: false,
        showInLegend: false,
        zIndex: zIndex.series.tag,
        xAxis: CHART.axis.default,
        yAxis: 'y-axis-volume',
        type: 'area',
        color: lookupColors[2],
        data: [],
        dataGrouping: { enabled: false },
        tooltip: { pointFormatter: Tooltip.tag }
    };

    const seriesPositive = {
        id: 'series-positive',
        name: 'Positive sentiment:',
        yAxis: 'y-axis-sentiment',
        xAxis: CHART.axis.default,
        color: '#009900',
        zIndex: zIndex.series.sentiment,
        tickColor: '#474747',
        type: 'column',
        visible: false,
        showInLegend: false,
        dataGrouping: { enabled: false },
        tooltip: { pointFormat: CHART.tooltip.pointFormat.positiveSentiment }
    };

    const seriesNegative = {
        id: 'series-negative',
        name: 'Negative sentiment',
        yAxis: 'y-axis-sentiment',
        xAxis: CHART.axis.default,
        color: '#FF0000',
        zIndex: zIndex.series.sentiment,
        type: 'column',
        visible: false,
        showInLegend: false,
        dataGrouping: { enabled: false },
        tooltip: { pointFormat: CHART.tooltip.pointFormat.negativeSentiment }
    };

    const seriesAlert = {
        id: 'series-alert',
        name: 'alert',
        yAxis: 'y-axis-alert',
        zIndex: zIndex.series.alert,
        xAxis: CHART.axis.default,
        data: [],
        color: 'rgba(254,235,236,0.1)',
        lineColor: 'transparent',
        showInLegend: false,
        dataGrouping: { enabled: false },
        lineWidth: 0,
        minorGridLineWidth: 0,
        tooltip: { pointFormatter: Tooltip.alert }
    };

    const xAxisPriceline = {
        dateTimeLabelFormats: { hour: '%l:%M%P' },
        gridZIndex: 0,
        type: 'datetime',
        labels: { overflow: 'justify' },
        id: 'x-axis-priceline',
        events: {}
    };

    const xAxisSentiment = {
        id: 'x-axis-sentiment',
        labels: { enabled: false },
        lineWidth: 0,
        gridLineWidth: 0,
        gridZIndex: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        tickColor: 'transparent',
        showEmpty: false,
        visible: false,
        zIndex: zIndex.axis.sentiment
    };

    const xAxisAlert = {
        id: 'x-axis-alert',
        plotLines: [{
            id: 'alert-plotline',
        }],
        plotBands: [{
            id: 'alert-plotband',
        }],
        // linkedTo: 0, // commented out to prevent error #11
        showEmpty: false,
        lineWidth: 0,
        gridLineWidth: 0,
        gridZIndex:0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        tickColor: 'transparent',
        labels: { enabled: false },
        zIndex: zIndex.axis.alert
    };

    const xAxisDefault = {
        id: CHART.axis.default,
        zIndex: zIndex.axis.default,
        lineWidth: 0,
        gridLineWidth: 0,
        gridZIndex:0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        tickColor: 'transparent',
        labels: { enabled: false }
    };

    const yAxisPrice = {
        id: 'y-axis-price',
        height: '100%',
        gridLineColor: '#656565',
        gridLineDashStyle: 'longdash',
        opposite: true,
        labels: {
            format: '${value:.2f}',
            style: { color: '#4C73FF' }
        },
        title: {
            text: 'Price',
            style: { color: '#4C73FF' }
        }
    };

    const yAxisVol = {
        id: 'y-axis-volume',
        gridLineWidth: 0,
        title: {
            text: 'Frequency',
            position: 'absolute',
            x: 0,
            style: { color: '#BFBFBF' }
        },
        labels: {
            style: { color: '#BFBFBF' }
        },
        opposite: false
    };

    const yAxisSentiment = {
        id: 'y-axis-sentiment',
        bottom: '30%',
        height: '30%',
        top: '70%',
        gridLineWidth: 0,
        maxPadding: 0,
        minPadding: 0,
        offset: 0,
        title: {
            enabled: false,
            text: null,
            // text: 'Sentiment',
            // x: 0,
            // style: { color: '#BFBFBF' }
        },
        labels: {
            x: 0,
            y: 0,
            enabled: true,
            style: {
                color: '#BFBFBF',
                opacity: 0
            }
        },
        opposite: false
    };

    const yAxisAlert = {
        id: 'y-axis-alert',
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        title: {
            enabled: false
        },
        labels: { enabled: false }
    };

	return {
		options,
		priceLine,
		tag0_frequency,
        tag1_frequency,
        tag2_frequency,
        tag0_mentions,
        tag1_mentions,
        tag2_mentions,
		seriesPositive,
		seriesNegative,
		seriesAlert,
		xAxisPriceline,
		xAxisSentiment,
		xAxisAlert,
		xAxisDefault,
		yAxisPrice,
		yAxisVol,
		yAxisSentiment,
		yAxisAlert
    };
}