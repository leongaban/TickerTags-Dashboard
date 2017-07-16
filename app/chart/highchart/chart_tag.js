module.exports = angular
    .module('tickertags-chart')
    .factory('ChartTag', ChartTag);

ChartTag.$inject = [
    '$q',
    'Dashboard',
    'Format',
    'TagsContainer',
    'Util'];

function ChartTag(
    $q,
    Dashboard,
    Format,
    TagsContainer,
    Util) {
    
    ////////////////////////////////////////////////////////////////////////////
    const notEmpty = Util.notEmpty;
    const volume = TagsContainer.volume;
    const toMilliseconds = Format.toMilliseconds;
    const formatEpochXAxis = R.map(toMilliseconds);

    const getTags = (terms) => TagsContainer.rebuildContainer(terms).then((container) => container);

    const clear = (chart) => {
        const chartTagSeries = ['tag_frequency_0', 'tag_frequency_1', 'tag_frequency_2', 'tag_mentions_0', 'tag_mentions_1', 'tag_mentions_2', 'series-positive', 'series-negative'];
        chartTagSeries.map((series) => chart.get(series).update({ name: '', data: [], showInLegend: false }, false));
        return chart;
    };

    const formatSingleTagSeries = (tag) => {
        const epochs = formatEpochXAxis(tag.start_epoch);
        const tagVolume = volume(tag);
        return { name: tag.name, frequency: _.zip(epochs, tagVolume.incidences), mentions: _.zip(epochs, tagVolume.mentions) };
    };

    const showSentiment = (chart, redraw = false) => {
        chart.get('y-axis-price').update({ height: '70%', bottom: '30%' }, redraw);
        chart.get('y-axis-volume').update({ height: '70%', bottom: '30%' }, redraw);
        chart.get('y-axis-sentiment').update({ title: {enabled: true }}, redraw);
        chart.get('series-positive').setVisible(true, redraw);
        chart.get('series-negative').setVisible(true, redraw);
        return chart;
    };

    const updateSentiment = (chart, sentimentSeries) => {
        notEmpty(sentimentSeries) ? showSentiment(chart) : hideSentiment(chart);

        const xAxis = formatEpochXAxis(sentimentSeries.epochs);
        const yAxis_positive = sentimentSeries.positive;
        const yAxis_negative = sentimentSeries.negative;
        const positiveSentimentData = _.zip(xAxis, yAxis_positive);
        const negativeSentimentData = _.zip(xAxis, yAxis_negative);

        chart.get('series-positive').setData([], false);
        chart.get('series-negative').setData([], false);

        chart.get('series-positive').setData(positiveSentimentData, false);
        chart.get('series-negative').setData(negativeSentimentData, true);

        return chart;
    };

    const displaySentiment = (chart, sentimentData) => {
        showSentiment(chart, true);
        updateSentiment(chart, Format.sentimentData(sentimentData), false);
    };

    const hideSentiment = (chart) => {
        chart.get('series-positive').setVisible(false, false);
        chart.get('series-negative').setVisible(false, false);
        chart.get('y-axis-sentiment').update({ title: { enabled: false }}, false);
        chart.get('y-axis-price').update({ height: '100%', bottom: '0%' }, true);
        chart.get('y-axis-volume').update({ height: '100%', bottom: '0%' }, true);
        return chart;
    };

    const tagLegendStatus = (type, chart, tagSeries, tagName, index) => {
        const tagSeriesName = type === 'frequency' ? 'tag_frequency_'+index : 'tag_mentions_'+index;
        chart.get(tagSeriesName).update({ data: tagSeries[type], name: tagName, showInLegend: true }, true);
        return chart;
    };

    const render = R.curry((chart, tag, index, isFrequency) => {
        const tagSeries = formatSingleTagSeries(tag);
        chart = isFrequency
            ? tagLegendStatus('frequency', chart, tagSeries, tag.name, index)
            : tagLegendStatus('mentions', chart, tagSeries, tag.name, index);
        return chart;
    });

    const add = _.curry((event, chart, isFrequency, tagData, sentimentData) => {
        /* This event handler gets called with no data... investigate why
         *  That is why this check is in place, to avoid a type error
         * */
        if (tagData === null || sentimentData === null) {
            throw new Error('No tag or sentiment data, unable to render to chart')
        }

        const clearedChart = clear(chart);

        if (notEmpty(tagData)) {
            _.each(tagData, (tagSeriesData, i) => {
                render(chart, tagSeriesData, i, isFrequency);
            });

            R.equals(Dashboard.get('social'), 'tweets') ? displaySentiment(clearedChart, sentimentData) : hideSentiment(clearedChart);
        }

        return clearedChart;
    });

    /* After rendering the tags volume and sentiments to reset the priceline graph
     * is necessary to call this function; to retrieve the current data present in the graph
     * and extract the x and y coordinates to use along with */
    // const removeSentiment = (chart) => {
    //     const series = ['tag0', 'tag1', 'tag2', 'series-positive', 'series-negative'];
    //     series.map((id) =>  chart.get(id).update({data: [], name: '', showInLegend: false}, false));
    //     return hideSentiment((chart));
    // };

    const series = (chart, tags, commonParams, isFrequency, streamType) => {
        if (notEmpty(tags)) {
            return TagsContainer.retrieveVolData(tags, commonParams, streamType, false).then((tagData) => {
                const isSentiment = (streamType) => streamType === 'tweets';
                const sentimentData = TagsContainer.retrieveVolData(tags, commonParams, streamType, isSentiment(streamType));
                const nonEventDisplayTagsGraph = add(null, chart, isFrequency);
                return $q.all({ tags: tagData, sentiment: sentimentData })
                    .then((data) => nonEventDisplayTagsGraph(data.tags, data.sentiment));
            });
        }
    };

    return {
        getTags,
        clear,
        showSentiment,
        hideSentiment,
        updateSentiment,
        displaySentiment,
        formatSingleTagSeries,
        add,
        // remove,
        // removeSentiment,
        render,
        series
    }
}