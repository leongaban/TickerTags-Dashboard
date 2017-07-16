///////////////////////////////////////////////////////////////////////////////
/**
 * @name FeedFactory
 * @namespace Factories
 * @desc Service to interact with Feed tickers_panel and the Websockets
 */
module.exports = angular
    .module('tickertags-feed')
    .factory('FeedFactory', factory);

factory.$inject = [
    '$httpParamSerializer',
    '$location',
    '$rootScope',
    '$state',
    '$websocket',
    'Alerts',
    'api',
    'ApiFactory',
    'EPOCH',
    'Format',
    'Session',
    'Settings',
    'TickersFactory',
    'UserFactory',
    'Unread',
    'Util'];

function factory(
    $httpParamSerializer,
    $location,
    $rootScope,
    $state,
    $websocket,
    Alerts,
    api,
    ApiFactory,
    EPOCH,
    Format,
    Session,
    Settings,
    TickersFactory,
    UserFactory,
    Unread,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const formatDate = Alerts.format;
    const not = R.not;
    const changeKeyName = Util.changeKeyName;
    const isMomentum = Util.isMomentum;
    const isInsight = Util.isInsight;
    const limitReached = false;
    const pushedAlerts = [];
    const twentyFourHours = 86400;
    const tracer = R.curry((msg, x) => !console.log(msg) && x);
    const prop = R.prop;

    let WEBSOCKET_CONN;
    let WEBSOCKET_IS_NOT_BLOCKED = true;
    let WEBSOCKET_CHECK_SEARCHED = false;
    let ALERTS = [];
    let SEARCHED_TICKERS = [];
    let SEARCHED_TAGS = [];

    const APPROVAL_STATUS = new Set(['approved']);

    const removeFeedItem = (alert, indexToRemove) => {
        // let id = alert.type !== 'insight' ? 'term_trend_id' : 'insight_id';
        // alerts = R.reject(R.eqProps(id, alert), alerts);
        ALERTS.splice(indexToRemove, 1);
        return ALERTS;
    };

    // const APPROVAL_STATUS_MAP = new Map([['pending', 0],['approved', 1]]);

    const statusToggle = (status, approval_status = APPROVAL_STATUS) => approval_status.has(status) ? approval_status.delete(status) && approval_status : approval_status.add(status) ;

    // const statusParam = (admin) => R.not(admin) ? 0 : Array.from(APPROVAL_STATUS).map(mapping => APPROVAL_STATUS_MAP.get(mapping)).toString();
    const role = (user) => user.role === 'Admin';

    const filterWebsocket = () => WEBSOCKET_CHECK_SEARCHED = true;

    const returnSearchedTickers = () => SEARCHED_TICKERS;
    const returnSearchedTags    = () => SEARCHED_TAGS;

    const clearSearchedTickers = (item) => _.pull(SEARCHED_TICKERS, item);
    const clearSearchedTags    = (item) => _.pull(SEARCHED_TAGS, item);

    const path = (isAdmin) => `${api.websocket}${isAdmin ? 'admin' : 'ws'}`;

    const fetch = (alert) => ApiFactory.retrieveAlerts({term_trend_id: alert.term_trend_id}).catch(tracer('error from fetch function'));

    const nonInsight = (alert) => {
        const predicate = R.propEq("term_trend_id", alert["term_trend_id"]);
        const selected = R.find(predicate, ALERTS);
        if (selected) {
            const updatedFeed = R.reject(predicate, ALERTS);
            updatedFeed.unshift(processAlerts(selected));
            return Promise.resolve(updatedFeed);
        }
        else {
            return fetch(alert).then(R.prop('alerts')).then((alertFromRemote) => {
                if (Util.notEmpty(alertFromRemote)) {
                    ALERTS.unshift(processAlerts(alertFromRemote));
                }
                else {
                    console.log(`Alert with term trend id: ${alert.term_trend_id} not found`);
                }
                return ALERTS;
            });
        }
    };

    const move = (alert) => not(isInsight(alert)) ? nonInsight(alert) : Promise.resolve(ALERTS);

    const webSocket = (bool) => WEBSOCKET_IS_NOT_BLOCKED = bool;

    const doesAlertTickerMatchSearched = (alert) => {
        if (alert.tickers) {
            const matched = _.intersection(SEARCHED_TICKERS, alert.tickers);
            return !_.isEmpty(matched);
        } else {
            const notFound = _.isEmpty(_.find(SEARCHED_TICKERS, alert.ticker));
            return !notFound;
        }
    };

    const doesAlertTermMatchSearched = (term) => {
        const matched = _.intersection(SEARCHED_TAGS, term);
        return !_.isEmpty(matched);
    };

    const resetSearchedCheck = () => WEBSOCKET_CHECK_SEARCHED = false;

    const alertTypeFilter = (settings, alert) => {
        const _setting = Util.supportLegacyAlert(settings);
        return prop(prop('type', alert), _setting);
    };

    const isTickerInPortfolio = (settings, alert) => {
        const port = new Set(settings.port_tickers);
        return R.any(R.map((ticker) => port.has(ticker)), alert.tickers);
    };

    const tickers_filter = (settings, alert) => {
        return settings.all_tickers ? settings.all_tickers : isTickerInPortfolio(settings, alert);
    };

    const updateFeed = (predicate, alert, user) => {
        // Flag to add fade-from-right animation:
        alert.new = true;
        let prop = alert.type != 'insight' ? 'term_trend_id' : 'insight_id';
        let index =  R.findIndex(R.eqProps(prop, alert), ALERTS);

        if (predicate) {
            if (Util.existIndex(index)) {
                ALERTS = R.update(index, alert, ALERTS);
            }
            else {
                ALERTS = R.prepend(alert, ALERTS)
            }
            if (Settings.get().current.alert_settings.enabled) { Unread.increase(user, alert) };
            $rootScope.$emit("feedPanel.feed.update", ALERTS);
            $rootScope.$emit("platformHeader.new.alert");
        }
        return ALERTS;
    };

    const incomingMessage = (message) => {
        const user = Session.get();
        const settings = Settings.get().current.alert_settings;
        let alert = JSON.parse(message.data);

        // ToDo: Hack
        if (typeof alert !== 'object') { alert = JSON.parse(alert); }

        // ToDo: fix should push spec filter before pushing to production
        alert = Alerts.format(alert);
        alert.percent_change = Math.round(alert.percent_change);

        if (user.isAdmin && R.equals(alert.approved)) {
            ALERTS = removeFeedItem(alert);
            $rootScope.$emit("feedPanel.feed.update", ALERTS);
        }

        let shouldPush = R.and(alertTypeFilter(settings, alert), tickers_filter(settings, alert));
        if (WEBSOCKET_CHECK_SEARCHED) {
            if (!_.isEmpty(SEARCHED_TICKERS)) shouldPush = doesAlertTickerMatchSearched(alert);
            if (!_.isEmpty(SEARCHED_TAGS))    shouldPush = doesAlertTermMatchSearched(alert.term);
        }

        return updateFeed(shouldPush, alert, user);
    };

    const openWebsocket = function (url) {
        const ws = $websocket(url);

        ws.onOpen((event) => {
            // console.log('Realtime connection established:', event);
            WEBSOCKET_CONN = ws;
        });
        ws.onMessage(incomingMessage);
        // ws.onClose(event => console.log(`Realtime connection closed`, event));
        // ws.onError(event => console.log(`Realtime connection encountered an error`, event));
    };

    const prepWebsocket = (userInfo) => {
        if (R.isNil(userInfo)) return null;
        const isAdmin = role(userInfo);
        const url = path(isAdmin);
        return openWebsocket(url);
    };

    const set20Alerts = (formattedAlerts) => { ALERTS = formattedAlerts; };

    const wireAlerts = (res, loadOne, infiniteScroll) => {
        const filteredAlerts = R.filter(Util.notEmpty, res.alerts);
        const formattedAlerts = formatAlerts(filteredAlerts);
        const isFinished = formattedAlerts.length < 20;

        infiniteScroll ? ALERTS = ALERTS.concat(formattedAlerts) : set20Alerts(formattedAlerts);

        return { ALERTS, isFinished };
    };

    const prepareTickerParameter = (array) => array.map((ticker) => ticker).join(',').toString();

    const prepareTermsParameter  = (array) => array.map((tag) => tag.term_id).join(',').toString();

    const buildTickerParams = (params, alertSettings) => {
        const tickers = prepareTickerParameter(alertSettings.port_tickers);
        return tickers.length ? _.set(params, 'ticker', tickers) : params;
    };

    const buildAlertTypeParams = (params, alertSettings) => {
        const query = []; // Adding back in legacy Alert types:
        if (alertSettings.tag_insight)  { query.push('tag_insight');  query.push('insight'); }
        if (alertSettings.tag_breaking) { query.push('tag_breaking'); query.push('spike'); }
        if (alertSettings.tag_momentum) { query.push('tag_momentum'); query.push('momentum'); }
        return query.length ? _.set(params, 'alert_type', query.join(',')) : params;
    };

    const alertParams = (params, alertSettings, searchType) => {
        params = buildAlertTypeParams(params, alertSettings);
        if (!alertSettings.all_tickers) params = buildTickerParams(params, alertSettings);
        if (searchType === 'tags')    delete params['ticker'];
        if (searchType === 'tickers') delete params['term_id'];
        return params;
    };

    const setPortTickers = () => {
        return TickersFactory.setPortfoliosTickers();
    };

    const loadFeed = (start = 0, limit = 20, tickers, tags, isAdmin = null, searchType = '', infiniteScroll) => {
        const alert_settings = Settings.get().current.alert_settings;
        alert_settings.port_tickers = setPortTickers();
        console.log('alert_settings', alert_settings);
        const params = alertParams({}, alert_settings, searchType);
        let loadOne = false;

        if (!_.isEmpty(tickers)) {
            _.set(params, 'ticker', prepareTickerParameter(tickers));
        }

        if (!_.isEmpty(tags)) {
            _.set(params, 'term_id', prepareTermsParameter(tags));
        }

        if (start) {
            _.set(params, 'start', start);
        }

        if (limit) {
            _.set(params, 'limit', limit);
            if (limit === 1) loadOne = true;
        }

        _.set(params, 'approved', (isAdmin ? 0 : 1));
        if (R.not(isAdmin)) {
            _.set(params, 'timestamp', EPOCH.earliest.tweets);
        }
        // Create filter query based on the users alert settings
        return ApiFactory.retrieveAlerts(params).then((res) => {
            console.log(' res', res);
            return wireAlerts(res, loadOne, infiniteScroll);
        }).catch(tracer('error from loading feed'));
    };

    const emptyFeed = () => {
        ALERTS = [];
        return ALERTS;
    };

    const formatCopy = (alert) => {
        const alertCopied = alert;
        if (alertCopied.type !== 'tag_insight') alertCopied.percent_change = Math.round(alertCopied.percent_change);
        if (R.length(alertCopied.title) > 100) alertCopied.shortTitle = Format.truncate(alertCopied.title, 100);
        if (R.length(alertCopied.note) > 100)  alertCopied.shortNote  = Format.truncate(alertCopied.note, 100);
        return alertCopied;
    };

    const mainLinkCheck = (alert) => {
        const firstLink = R.head(alert.link);
        return !(firstLink && firstLink.url === 'noMainLink');
    };

    const formatLink = (alert) => {
        const alertLinked = Util.getAlertObject(alert);
        alertLinked.hasLink = R.isEmpty(alertLinked.link) ? false : mainLinkCheck(alertLinked);
        return alertLinked;
    };

    const notArray = R.compose(R.not, R.isArrayLike);

    const createTickers = (alert) => R.assoc('tickers', Array.of(alert.tickers), alert);

    const formatTickers = (alert) => notArray(alert.tickers) ? createTickers(alert) : alert;

    const processAlerts = R.compose( formatTickers,formatLink,formatCopy,formatDate);

    const formatAlerts = (alerts) => {
        R.chain(processAlerts, alerts);
        return alerts;
    };

    const createInsightURL = (alert) => {
        if (alert.top)       delete alert.top;
        if (alert.portfolio) delete alert.portfolio;
        if (alert.searched)  delete alert.searched;
        return $httpParamSerializer((alert));
    };

    const createBreakingMomentumURL = (alert) => {
        const terms = ['term_id'];
        const params = R.pick(R.concat(['timespan', 'sort', 'tickers'], terms));
        const flatTicker = R.over(R.lensProp('tickers'), R.head);
        const basics = R.compose(flatTicker, params);
        const tickerKey = changeKeyName('tickers', 'ticker');
        const termKey = changeKeyName('term_id', 'term_id_1');
        const changeKeys = R.compose(tickerKey, termKey);
        return $httpParamSerializer(changeKeys(basics(alert)));
    };

    const alertURL = (alert) => isInsight(alert) ? createInsightURL(alert) : createBreakingMomentumURL(alert);

    const createAdditionals = (stateParams) => {
        return '&start_epoch='+stateParams.start_epoch+'&end_epoch='+stateParams.end_epoch+'&timespan='+stateParams.timespan+'&sort='+stateParams.sort;
    };

    // Approve or Deny alerts
    const submit = (alert, approved, indexToRemove) => {
        const partial = alertURL(alert);
        const url = "!/dashboard?";
        const additional = createAdditionals($state.params);

        alert.url = url + partial + additional;
        alert.approved = approved;
        alert.terms = [alert.term_id];
        alert.alert_type = alert.type;
        
        const relevantKeys = [
            'alert_type',
            'approved',
            'term_trend_id',
            'terms',
            'tickers',
            'title',
            'note',
            'link',
            'url'
        ];

        const params = R.pick(relevantKeys, alert);
        return ApiFactory.submitNotification(params).then(() => removeFeedItem(alert, indexToRemove));
    };

    const breakingPadding = (feedItem) => {
        const alertEpoch      = feedItem.start_epoch;
        const alertEpochStart = alertEpoch - twentyFourHours;
        const alertEpochEnd   = alertEpoch + twentyFourHours;
        return { start: alertEpochStart, end: alertEpochEnd };
    };

    const momentumPadding = (feedItem) => {
        const alertEpochStart = feedItem.start_epoch - twentyFourHours;
        const alertEpochEnd   = feedItem.end_epoch + twentyFourHours;
        return { start: alertEpochStart, end: alertEpochEnd };
    };

    const insightPadding = (feedItem) => {
        return { start: feedItem.start_epoch, end: feedItem.end_epoch };
    };

    const epochPadding = (feedItem) => {
        return isInsight(feedItem) ? insightPadding(feedItem)  :
              isMomentum(feedItem) ? momentumPadding(feedItem) : breakingPadding(feedItem);
    };

    const changeState = (ticker, id1, id2=null, id3=null, start, end, timespan='year') => {
        $state.go('container.dashboard.tickers.tags.activity', {
            ticker: ticker,
            term_id_1: id1,
            term_id_2: id2,
            term_id_3: id3,
            start_epoch: start,
            end_epoch: end,
            timespan:timespan
        });
    };

    const intervals = ['minute', 'hour', 'day', 'week', 'month', 'year', '2year', 'max'];

    const getTimespan = (feedItem) => {
        const [duration, interval] = R.takeLast(2, feedItem.duration.split(' '));
        const next = R.or(isNaN(parseInt(duration)), R.gte(parseInt(duration), 1));
        const index = R.findIndex(R.equals(moment.normalizeUnits(interval)),  intervals);
        const location = next ? index + 1 : index;
        return R.nth(location, intervals);
    };

    const renderInsight = (feedItem) => {
        const ticker = R.isNil(feedItem.tickers) ? feedItem.ticker_1 : R.head(feedItem.tickers);
        const { start, end } = epochPadding(feedItem);
        const timespan = getTimespan(feedItem);

        changeState(ticker, feedItem.term_id_1, feedItem.term_id_2, feedItem.term_id_3, start, end, timespan);
    };

    const renderAlert = (feedItem) => {
        const ticker = R.head(feedItem.tickers);
        const {start, end} = epochPadding(feedItem);
        const timespan = getTimespan(feedItem);

        changeState(ticker, feedItem.term_id, null, null, start, end, timespan);
    };

    const downloadPDF = (insight_id, pdf_id) => ApiFactory.getPDF(insight_id, pdf_id);

    const web_conn = () => WEBSOCKET_CONN;

    // console.log('FeedFactory', $state.params);
    prepWebsocket(UserFactory.get().user);

    ////////////////////////////////////////////////////////////////////////////
    return {
        // vars
        ALERTS,
        WEBSOCKET_IS_NOT_BLOCKED,
        pushedAlerts,
        limitReached,
        // functions exposed for testing
        filterWebsocket,
        returnSearchedTickers,
        returnSearchedTags,
        clearSearchedTickers,
        clearSearchedTags,
        resetSearchedCheck,
        webSocket,
        prepWebsocket,
        path,
        // functions
        statusToggle,
        submit,
        loadFeed,
        emptyFeed,
        alertTypeFilter,
        updateFeed,
        move,
        renderInsight,
        renderAlert,
        downloadPDF,
        web_conn,

        // testing
        alertURL,
        isInsight,
        createInsightURL,

        // APPEND
        incomingMessage
    };
}