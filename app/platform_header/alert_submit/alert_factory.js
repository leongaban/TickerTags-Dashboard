/**
 * Created by paulo on 25/06/2016.
 */
module.exports = angular
    .module('tickertags-alert')
    .factory('Alerts', factory);

factory.$inject = [
    '$q',
    '$rootScope',
    'ApiFactory',
    'Format',
    'Settings',
    'Util',
    'zIndex'];

function factory(
    $q,
    $rootScope,
    ApiFactory,
    Format,
    Settings,
    Util,
    zIndex) {

    ////////////////////////////////////////////////////////////////////////////
    const not = R.not;
    const equals = R.equals;
    const isMomentum = Util.isMomentum;
    const notEmpty = Util.notEmpty;
    const apiError = ApiFactory.apiError;
    const toMilliseconds = Format.toMilliseconds;
    const changeKeyName = Util.changeKeyName;

    const byType = (alertSettings) => {
        const serverSafe = Util.supportLegacyAlert(alertSettings);
        const byActive = (type) => serverSafe[type];
        const query = ['insight', 'spike', 'momentum'];
        const types = query.filter(byActive);
        return types.join(',');
    };

    const selectDisplayDate = (alert) => {
        // If alert is in Array (from chart click) get alert object
        const thisAlert = Util.getAlertObject(alert);

        if (!thisAlert.type) throw new TypeError('alert does not have an alert.type');
        switch (thisAlert.type) {
            case 'insight'  : return thisAlert.timestamp;
            case 'spike'    : return thisAlert.start_epoch;
            case 'momentum' : return thisAlert.end_epoch;
        }
    };

    const formatDate = (alert) => {
        // This function formats the date to be displayed on the feed item
        const date = selectDisplayDate(alert);
        alert.date = moment.unix(date).format('M/D/YYYY')+ " ";
        alert.hour = moment.unix(date).format('hh:mm a');
        alert.timestamp = moment.unix(date).format('MM/DD/YY hh:mm a');
        alert.duration =  moment.unix(alert.start_epoch).to(moment.unix(alert.end_epoch), true);
        return alert;
    };

    const formatType = (alert) => alert.alert_type ? R.assoc('type', alert.alert_type, alert) : alert;

    const formatPercent = (alert) => {
        return R.and(R.has('percent_change', alert), isNaN(alert.percent_change)) ? R.assoc('percent_change', 0, alert) : alert;
    };

    const format = R.compose(formatDate, formatType, formatPercent);

    const prepareAlertSeries = (alert) => {
        const formatted = format(alert);
        const name = formatted.term;
        const epoch = toMilliseconds(formatted.start_epoch);

        return {
            name: name,
            percentChange: formatted.percent_change,
            start: formatted.start_epoch,
            end: formatted.end_epoch,
            type: formatted.type,
            timestamp: formatted.timestamp,
            duration: formatted.duration,
            x: epoch,
            y: 0
        };
    };

    const changeTickerKey  = changeKeyName('ticker', 'ticker_1');
    const changeTermName   = changeKeyName('term', 'term_name_1');
    const transformInsight = R.compose(changeTickerKey, changeTermName);

    const insightTagCountCheck = (alert) => alert.term_id_2 ? false : true;

    const emitInsightClick = (alert) => emitAlertClick(transformInsight(alert));

    const emitAlertClick = (alert) => {
        alert.date = Format.createDate(alert);
        $rootScope.$emit("feedpanel.alert.clicked", alert);
    };

    const formatPlotLine = _.curry((chart, color, alert) => {
        if (!alert) {
            throw new Error('No alerts have been supplied');
        }
        return {
            color: color,
            value: isMomentum(alert) ? toMilliseconds(alert.end_epoch) : toMilliseconds(alert.start_epoch),
            width: 4,
            id: 'alert-plotline',
            type: alert.type,
            zIndex: zIndex.rendered.plotline,
            events: {
                click: function(event) {
                    // console.log('chart alert click', event, alert);
                    not(equals(alert.type, 'insight'))
                        // Breaking or Momentum Alert
                        ? emitAlertClick(transform(alert)) : insightTagCountCheck(alert)
                        // Insight with 1 Tag       Insight with multiple Tags
                        ? emitInsightClick(alert) : returnMissingTerms(alert).then((updatedAlert) => emitInsightClick(updatedAlert));

                    this.axis.chart.get('x-axis-alert').removePlotLine(this.options.value);
                },
                mouseover: function() {
                    this.axis.chart.get('x-axis-alert').addPlotLine({
                        value: this.options.value,
                        color: 'red',
                        width: 6,
                        id: this.options.value,
                        events: {
                            // click: function() {
                                // console.log('highlighted alert clicked');
                            // }
                        }
                    });
                },
                mouseout: function() {
                    this.axis.chart.get('x-axis-alert').removePlotLine(this.options.value);
                }
            }
        }
    });

    const formatPlotBand = _.curry((color, alert) => {
        return {
            color,
            from: toMilliseconds(alert.start_epoch),
            to: toMilliseconds(alert.end_epoch),
            id: 'alert-plotband',
            type: alert.type,
            events: {
                // click: function() {
                    // console.log('plotband clicked');
                // }
            }
        }
    });

    const transform = (alert) => {
        return {
            approved: alert.approved,
            end_epoch: alert.end_epoch,
            duration: alert.duration,
            start_epoch: alert.start_epoch,
            term: alert.term,
            term_trend_id:alert.term_trend_id,
            term_id: alert.term_id_1,
            tickers: [alert.ticker],
            type: alert.type
        }
    };

    const getMissingTagNames = (termIds) => {
        const promises = _.map(termIds, (termId) => {
             return ApiFactory.getTagDataSlim(termId).then((ticker_tag) => {
                return { term: ticker_tag.term };
            });
        });

        return $q.all(promises);
    };

    const returnMissingTerms = (alert) => {
        const hasTerm2 = R.prop('term_id_2', alert);
        const hasTerm3 = R.prop('term_id_3', alert);
        const missingTerms = [];

        if (notEmpty(hasTerm2)) missingTerms.push(hasTerm2);
        if (notEmpty(hasTerm3)) missingTerms.push(hasTerm3);

        return getMissingTagNames(missingTerms, alert.ticker).then((tags) => {
            if (tags[0]) alert.term_name_2 = tags[0].term;
            if (tags[1]) alert.term_name_3 = tags[1].term;
            return alert;
        });
    };

    const shouldRender = (state, renderFN) => { if (state) return renderFN; };

    const renderChartAlerts = _.curry((chart, alertObjects) => {
        const xAxis = chart.get('x-axis-alert');
        const alertSeries = chart.get('series-alert');
        const alertSeriesData = R.map(prepareAlertSeries, alertObjects);
        const setPlotLineData = formatPlotLine(chart, 'rgba(254,235,236,0.5)');
        const setPlotBandData = formatPlotBand('rgba(254,235,236,0.1)');
        const plotLineData = R.map(setPlotLineData, alertObjects);
        const plotBandData = R.map(setPlotBandData, alertObjects);

        alertSeries.setData(alertSeriesData, false);

        _.each(plotLineData, (lineData, index) => {
            xAxis.addPlotLine(lineData);
            if (isMomentum(lineData)) {
                xAxis.addPlotBand(plotBandData[index]);
            }
        });

        return chart;
    });

    const filterPredicate = (tag) => tag.term;
    const noUndefinedTerms = R.filter(filterPredicate);
    const extractTermIds = R.map(R.prop('term_id'));
    const makeString = (array) => array.toString();
    const termIdString = R.compose(makeString, extractTermIds, noUndefinedTerms);

    const getAlertsVol = (ticker, tags, params) => {
        const term_ids = Util.notUndefined(tags) ? termIdString(tags) : '';
        const feedSettings = Settings.get().current.alert_settings;

        const parameters = {
            alert_type: byType(feedSettings),
            start: params.start,
            end: params.end,
            group: params.group,
            order: 'asc'
        };
        if (ticker !== 'SPY') {
            parameters.ticker = ticker;
        }
        if (Util.notEmpty(term_ids)){
            parameters.term_id = term_ids;

        }

        return ApiFactory.alertsVolume(parameters).catch(apiError);
    };

    const alertLine = _.curry((ticker, tags, params, alertsOn, chart) => {
        if (alertsOn) {
            const renderAlerts = renderChartAlerts(clearChartAlerts(chart));
            return getAlertsVol(ticker, tags, params).then(renderAlerts);
        } else {
            return Promise.resolve(clearChartAlerts(chart));
        }
    });

    const clearChartAlerts = (chart) => {
        const xAxis = chart.get('x-axis-alert');
              xAxis.removePlotLine('alert-plotline');
              xAxis.removePlotBand('alert-plotband');
        chart.get('series-alert').setData([], false);
        return chart;
    };

    return {
        format,
        getAlertsVol,
        alertLine,
        shouldRender,
        renderChartAlerts,
        formatPlotBand,
        formatPlotLine,
        byType,
        clearChartAlerts,
    }
}