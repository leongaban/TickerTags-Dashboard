////////////////////////////////////////////////////////////////////////////////
/**
 * @name HighChartViewController
 * @desc Controller for HighChart
 */
export default function HighChartViewController(
    container,
    $rootScope,
    $state,
    Alerts,
    ChartConfig,
    ChartExport,
    ChartFactory,
    ChartTag,
    ChartTicker,
    Format,
    State,
    SizingFactory,
    TagsContainer,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const notEmpty = Util.notEmpty;
    const renderChart = ChartFactory.renderChart;
    const setupTagLine = ChartTag.series;
    const setupPriceLine = ChartTicker.series;
    const isFrequency = Util.isFrequency($state.params.social);

    const chartClick = (event) => {
        const start_epoch = this.startEpoch;
        const end_epoch = Math.round(event.point.category / 1000);
        State.go('.tickers.tags.activity', { start_epoch, end_epoch });
    };

    const hideSeries = (socialState, chart) => {
        chart.get(`tag_${socialState}_0`).hide();
        chart.get(`tag_${socialState}_1`).hide();
        chart.get(`tag_${socialState}_2`).hide();
        return chart;
    };

    const showSeries = (socialState, chart) => {
        chart.get(`tag_${socialState}_0`).show();
        chart.get(`tag_${socialState}_1`).show();
        chart.get(`tag_${socialState}_2`).show();
        chart = socialState === 'frequency' ? hideSeries('mentions', chart) : hideSeries('frequency', chart);
        return chart;
    };

    const updateChartData = (chart, ticker, tags, alerts, start, end) => {
        const streamType = $state.params.stream;
        if (!start || !end) throw new Error(`cannot request chart data without start and end parameters`);
        const params = { start,  end, order: 'asc' };
        const group = this.group? Format.asSeconds(this.group) : Format.groupStartEnd(params.start, params.end);
        const commonParams = _.set(params, 'group', group);
        const noDataType   = _.omit(params, 'data_type');
        const tagLine = (chart) => notEmpty(tags) ? setupTagLine(chart, tags, commonParams, isFrequency, streamType) : Promise.resolve(chart);
        const priceLine = setupPriceLine(chart, ticker, noDataType, 'series-priceline');
        const alertSeries = Alerts.alertLine(ticker, tags, noDataType, alerts, chart);
        if (chart.get('series-priceline')) { chart.get('series-priceline').update({ name: ticker }, false); }
        chart = isFrequency ? showSeries('frequency', chart) : showSeries('mentions', chart);

        // this.chartLoading = true;
        $rootScope.$emit('chart.set.loading', true);

        return priceLine.then(alertSeries).then(tagLine)
            .then((chart) => {
                chart.redraw();
                ChartExport.storeChart(chart);
                ChartFactory.getGranularity() ? $rootScope.$emit('granularity.changed') : null;

                // this.chartLoading = false;
                $rootScope.$emit('chart.set.loading', false);
                return chart;
            });
    };

    const setNewChartTicker = ChartTicker.getPrice;

    const setExtremes = (event) => {
        if (event.trigger === "navigator" || event.trigger === "zoom" ) {
            const start_epoch = Format.toSeconds(Math.round(event.min));
            const end_epoch   = Format.toSeconds(Math.round(event.max));
            const timespan = Util.timespan(start_epoch, end_epoch);
            const group = R.head(Util.granularity(timespan));
            State.go('.tickers.tags.activity', { start_epoch, end_epoch, timespan, group });
        }
    };

    const wireSetExtremes = (config) => {
        config.events = { setExtremes };
        return config;
    };

    const wireVolumeFormatter = (config, socialState) => {
        config.labels.formatter = volumeFormatter;
        config.title.text = isFrequency ? 'Frequency' : 'Mentions';
        return config;
    };

    function volumeFormatter() {
        if (this.value > 1000000) {
            this.value = Math.round(this.value / 1000000) + 'M';
        } else if (this.value > 1000) {
            this.value = Math.round(this.value / 1000) + 'K';
        }
        return this.value;
    }

    const initHighChart = (chart, ticker, tags, alerts, start, end) => {
        return setNewChartTicker(chart, ticker, start, end)
            .then((chart) => updateChartData(chart, ticker, tags, alerts, start, end));
    };

    const chartReflow = (chart) => chart.reflow();

    const mountChart = (chart, ticker, tags, alerts) => {
        initHighChart(chart, ticker, tags, alerts, this.startEpoch, this.endEpoch)
            .then((chart) => chartReflow(chart));
    };

    this.$onInit = () => {
        // Set state vars //////////////////////////////////////////////////////
        this.links       = $state.params.links === 'true';
        this.retweets    = $state.params.retweets === 'true';
        this.ticker      = Util.encodeTicker($state.params.ticker);
        this.startEpoch  = $state.params.start_epoch;
        this.endEpoch    = $state.params.end_epoch;
        this.chartAlerts = $state.params.chart_alerts;
        this.group       = $state.params.group;

        // Create chart options ////////////////////////////////////////////////
        const options = ChartConfig.options;
        const xAxisPriceline = wireSetExtremes(ChartConfig.xAxisPriceline);
        const yAxisVol = wireVolumeFormatter(ChartConfig.yAxisVol, $state.params.social);

        options.xAxis = [xAxisPriceline, ChartConfig.xAxisSentiment, ChartConfig.xAxisAlert, ChartConfig.xAxisDefault];
        options.yAxis = [ChartConfig.yAxisPrice, yAxisVol, ChartConfig.yAxisSentiment, ChartConfig.yAxisAlert];

        options.series = [
            ChartConfig.priceLine,
            ChartConfig.tag0_frequency,
            ChartConfig.tag0_mentions,
            ChartConfig.tag1_frequency,
            ChartConfig.tag1_mentions,
            ChartConfig.tag2_frequency,
            ChartConfig.tag2_mentions,
            ChartConfig.seriesPositive,
            ChartConfig.seriesNegative,
            ChartConfig.seriesAlert
        ];

        options.plotOptions.series.events = { click: chartClick };

        this.tickerTagsChart = Highcharts.chart('highchart-element', options);

        // Sizing //////////////////////////////////////////////////////////////
        const tagsOpen = $state.params.tags_open;
        const feedOpen = $state.params.feed_open;
        const chartMax = $state.params.chart_max;

        chartMax ? SizingFactory.setMax('highchart-element') : SizingFactory.setSize('highchart-element', tagsOpen, feedOpen);

        // Get Tags then mountChart ////////////////////////////////////////////
        TagsContainer.get().then((tags) => {
            this.container = tags;
            mountChart(this.tickerTagsChart, this.ticker, this.container, this.chartAlerts);
        });

        // Events //////////////////////////////////////////////////////////////
        $rootScope.$on('chart.reflow', () => chartReflow(this.tickerTagsChart));
    };
}