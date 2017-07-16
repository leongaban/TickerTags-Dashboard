////////////////////////////////////////////////////////////////////////////////
/**
* @name ChartExportFactory and ChartExportController
* @namespace Controller
* @desc Controller for the Chart Export Modal
*/

export default function ChartExportController(
    $rootScope,
    $state,
    ChartExport,
    ChartFactory,
    Message,
    State,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const isFrequency = Util.isFrequency($state.params.social);
    this.disableDownload = false;

    this.downloadCsv = () => {
        const chart = ChartExport.getChart();
        const tag0  = isFrequency ? chart.get('tag_frequency_0') : chart.get('tag_mentions_0');
        const tag1  = isFrequency ? chart.get('tag_frequency_1') : chart.get('tag_mentions_1');
        const tag2  = isFrequency ? chart.get('tag_frequency_2') : chart.get('tag_mentions_2');
        const stream = $state.params.stream;
        const term1 = $state.params.term_id_1;
        const term2 = $state.params.term_id_2;
        const term3 = $state.params.term_id_3;
        const chart_renamed = ChartExport.createFileName(chart);
        const chart_date_formatted = ChartExport.setDateFormat(chart_renamed);
        const chart_sentiment_columns = ChartExport.renameSentimentColumns(chart_date_formatted);
        const chart_tag_column_names = ChartExport.updateTagColumnNames(chart_sentiment_columns, term1, term2, term3, isFrequency);
        const chart_tag_data_formatted = ChartExport.formatTagData(chart_tag_column_names, tag0, tag1, tag2);
        const chart_series_removed = ChartExport.removeEmptySeries(chart_tag_data_formatted, tag0, tag1, tag2, stream);
        const chart_alerts_formatted = ChartExport.formatAlerts(chart_series_removed);
        const final_chart = ChartExport.updatePriceLine(chart_alerts_formatted);
        const tag_names = ChartExport.attachTagNames(final_chart, term1, term2, term3, isFrequency, stream);
        const filename = final_chart.options.exporting.filename + tag_names;

        final_chart.options.exporting.filename = filename;
        final_chart.downloadCSV();
        $state.reload();
        this.$close();
        Message.success(`Your CSV file: ${filename} has been downloaded!`);
    };

    this.changeGranularity = (granularity) => {
        this.disableDownload = true;
        ChartFactory.changingGranularity(true);
        State.go('.tickers.tags.activity', { group: granularity });
    };

    this.cancel = () => this.$close();

    this.$onInit = () => {
        this.feedPanel = $state.params.feed_open;
        this.grouping = ChartExport.getGroupingSize($state.params.timespan);
        this.granularity = R.isNil($state.params.group) ? ChartExport.determineGranularity($state.params.timespan) : $state.params.group;
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on('granularity.changed', () => {
        this.disableDownload = false;
        ChartFactory.changingGranularity(false);
    });
}