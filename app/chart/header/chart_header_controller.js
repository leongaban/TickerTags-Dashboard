////////////////////////////////////////////////////////////////////////////////
/**
 * @name ChartHeader
 * @namespace Component
 * @desc Displays Ticker in the ChartHeader and contains Chart export options
 */

export default function ChartHeaderCtrl(
    $state,
    ApiFactory,
    ChartExport,
    Message,
    State,
    TickersFactory) {

    //////////////////////////////////////////////////////////////////////////////
    const resetColors = () => { this.positive = this.negative = this.stagnant = false; };

    const colorPriceValue = (direction) => {
        resetColors();
        switch(direction) {
            case 'positive' : this.positive = true; break;
            case 'negative' : this.negative = true; break;
            case 'stagnant' : this.stagnant = true; break;
        }
    };

    const rightPush = (feed, chartMax) => feed && !chartMax;

    this.collapseTagsPanel = () =>
        State.go('.tickers.tags.activity', {
            tags_open: false,
            feed_open: $state.params.feed_open,
            chart_max: false
        });

    this.openTagsPanel = () =>
        State.go('.tickers.tags.activity', {
            tags_open: true,
            feed_open: $state.params.feed_open,
            chart_max: false
        });

    this.expandFeedPanel = () =>
        State.go('.tickers.tags.activity', {
            tags_open: $state.params.tags_open,
            feed_open: true
        });

    this.screenshotChart = () => {
        Message.success('Downloading your chart screenshot!');
        ChartExport.getChart().exportChart();
    };

    this.openExport = () => ChartExport.display();

    this.toggleChartAlerts = (current) => {
        this.chartAlerts = !current;
        ApiFactory.alertsChart({ chart: this.chartAlerts }).then(() => {
            State.go('.tickers.tags.activity', { chart_alerts: this.chartAlerts });
        });
    };

    this.toggleChartMax = () => {
        const chart_max = !$state.params.chart_max;
        
        if (chart_max) {
            State.go('.tickers.tags.activity', { tags_open: false, feed_open: false, chart_max })
        } else {
            State.go('.tickers.tags.activity', { tags_open: true,  feed_open: true,  chart_max });
        }
    };

    this.$onInit = () => {
        this.positive = '';
        this.negative = false;
        this.stagnant = false;
        this.direction = false;
        this.hidePrice = false;
        this.hidePercent = false;
        this.chartHeaderExpanded = false;
        this.chartAlerts = $state.params.chart_alerts;
        this.showFeedExpander = !$state.params.feed_open;
        this.tags_open = $state.params.tags_open;
        this.feed_open = $state.params.feed_open;
        this.chart_max = $state.params.chart_max;
        this.right300  = rightPush($state.params.feed_open, $state.params.chart_max);
        if (this.tagsOpen && $state.params.feed_open) this.smallText = true;
        if ($state.params.chart_max) this.showFeedExpander = false;

        TickersFactory.renderTickerDetails({ ticker: this.ticker }).then((ticker) => {
            this.companyName = ticker.company;
            this.price = ticker.price ? ticker.price : this.hidePrice = true;
            this.percent = ticker.percent ? ticker.percent : this.hidePercent = true;
            this.amount = ticker.amount;
            this.chartHeaderExpanded = !$state.params.tags_open;
            colorPriceValue(ticker.direction);
        });
    };
}
