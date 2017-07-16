export default function FeedPanelCtrl (
    $rootScope,
    $state,
    $window,
    api,
    DenyAlert,
    Dashboard,
    FeedFactory,
    Session,
    State,
    AlertApprove,
    Unread,
    Util,
    Websocket) {

    ////////////////////////////////////////////////////////////////////////////
    const feedCol = document.getElementById("feed-col");
    const LIMIT = 20;
    let START = 0;
    let LIMIT_REACHED = false;

    const loadMoreAlerts = () => {
        const init = null;
        const searchType = null;
        const infiniteScroll = true;
        START += LIMIT;
        this.loadingSpinner = true;
        return loadFeed(START, LIMIT, init, this.searchedTickers, this.searchedTags, searchType, infiniteScroll);
    };

    const isLimitReached = () => {
        return !LIMIT_REACHED ? loadMoreAlerts().then((feed) => {
            LIMIT_REACHED = feed.isFinished;
            this.loadingSpinner = false;
        }) : null;
    };

    const hitBottom = () => feedCol.scrollHeight - feedCol.scrollTop === feedCol.offsetHeight;

    const scrollingFeed = () => {
        Unread.reset();
        hitBottom() ? isLimitReached() : null;
    };

    const checkFeedEmpty = (init) => this.noAlerts = R.isEmpty(this.feed);

    const checkForPdfs = (feedItem) => {
        if (feedItem.pdfs && Util.notEmpty(feedItem.pdfs)) {
            // Refactor this if we start having more than 1 PDF per feedItem:
            feedItem.pdf_id = feedItem.pdfs[0];
            feedItem.pdf_btn = true;
        }
        return feedItem;
    };

    this.gotoAlertSettings = () => {
        const lastState = R.clone($state.params);
        Dashboard.savePreviousState(lastState);
        $state.go('settings.alerts', { default: false, feed_open: $state.params.feed_open });
    };

    this.downloadPDF = (insight_id, pdf_id) => {
        const pdf = `${api.insightsPdf}?insight_id=${insight_id}&pdf_id=${pdf_id}`;
        $window.open(pdf);
    };

    const loadFeed = (start = 0, limit = 20, init = null, tickers, tags, searchType = null, infiniteScroll = false) => {
        return FeedFactory.loadFeed(start, limit, tickers, tags, this.isAdmin, searchType, infiniteScroll)
            .then((feed) => {
            // this.feed = fake.alerts;
            this.feed = R.map(checkForPdfs, feed.ALERTS);
            this.alertsLoaded = true;
            checkFeedEmpty(init);
            return feed;
        });
    };

    const initFeedPanel = () => loadFeed(null, LIMIT, 'init');

    const loadOneAlert = () => loadFeed(START, 1);

    this.feedCollapseHover = () => this.collapseHover = true;

    this.feedCollapseLeave = () => this.collapseHover = false;

    this.closeFeedPanel = () => State.go('.tickers.tags.activity', { feed_open: false });

    const reloadFeedPanel = (searchType) => {
        this.searchedTickers = FeedFactory.returnSearchedTickers();
        this.searchedTags = FeedFactory.returnSearchedTags();
        this.alertsLoaded = false;
        resetFeedPanelScroll();
        loadFeed(0, null, null, this.searchedTickers, this.searchedTags, searchType);
    };

    const clearSearchCheck = () => {
        this.searchedTickers = FeedFactory.returnSearchedTickers();
        this.searchedTags    = FeedFactory.returnSearchedTags();

        if (R.isEmpty(this.searchedTickers) && R.isEmpty(this.searchedTags)) {
            this.thereAreSearched = false;
            FeedFactory.resetSearchedCheck();
        }

        reloadFeedPanel();
    };

    this.removeSearchItem = (type, item) => {
        type === 'tickers' ? FeedFactory.clearSearchedTickers(item) : FeedFactory.clearSearchedTags(item);
        clearSearchCheck();
    };

    this.approve = (feedItem, index) => {
        Websocket.envCheck(api);
        return AlertApprove
            .display(feedItem, index)
            .then((approved) => approved ? this.feed = this.feed.slice(index, 0) : null);
    };

    this.deny = (feedItem, index) => {
        this.feed.splice(index, 1);
        Websocket.envCheck(api);
        return FeedFactory.submit(feedItem, -1).then((feed) => this.feed = feed);
    };

    const articleLinkArray = (link) => { window.open(R.head(link).url, '_blank'); };

    const articleLinkString = (link) => { window.open(link, '_blank'); };

    this.readLink = (alert) => {
        Util.isType(alert.link) === 'Array' ? articleLinkArray(alert.link) : articleLinkString(alert.link);
    };

    this.readMore = (alert) => alert.hovered = true;

    this.leaveItem = (alert) => alert.hovered = false;

    this.clickAlert = (feedItem) => {
        return Util.isInsight(feedItem) ? FeedFactory.renderInsight(feedItem) : FeedFactory.renderAlert(feedItem);
    };

    this.denyBadAlert = (tag) => {
        Websocket.envCheck(api);
        return DenyAlert.display(tag);
    };

    const resetFeedPanelScroll = () => feedCol.scrollTop = 0;

    const runSearch = (ticker = [], tag = []) => {
        const type = R.isEmpty(ticker) ? 'tag' : 'ticker';
        FeedFactory.filterWebsocket();
        resetFeedPanelScroll();
        return loadFeed(0, null, null, ticker, tag, type).then((res) => {
            this.thereAreSearched = true;
            this.loadingSpinner = false;
        });
    };

    this.setTicker = (ticker) => {
        this.searchedTickers = [ticker.ticker];
        runSearch(this.searchedTickers);
    };

    this.setTag = (tag) => {
        this.searchedTags = [tag];
        runSearch([], this.searchedTags);
    };

    this.uiTerm = (term) => term ? term.join(' ') : null;

    this.$onInit = () => {
        // console.log('FeedPanel', $state.params);
        this.isAdmin = Session.get().isAdmin;
        this.noAlerts = false;
        this.alertsLoaded = false;
        this.thereAreSearched = false;
        this.collapseHover = false;
        this.searched = '';
        this.searchedTickers = [];
        this.searchedTags = [];
        this.feed = [];
        this.showFeed = Dashboard.panelStatus($state.params.feed_open, $state.params.chart_max);
        this.showFeed ? feedCol.addEventListener('scroll', scrollingFeed) : null;
        this.showFeed ? initFeedPanel() : null;
    };

    // Events //////////////////////////////////////////////////////////////////
    // $rootScope.$on("feedPanel.loadAnotherAlert", () => loadOneAlert());

    // From AlertFactory
    $rootScope.$on("feedpanel.alert.clicked", (event, alert) => {
        return FeedFactory.move(alert)
            .then((updatedFeed) => this.feed = updatedFeed)
            .then(this.clickAlert(alert));
    });

    // From FeedFactory
    $rootScope.$on("feedPanel.feed.update", (event, alerts) => {
        this.feed = alerts;
        this.noAlerts = false;
    });
}