import socialMediaHelp from './social_help_modal';

export default function SocialMediaController(
    $state,
    $uibModal,
    ApiFactory,
    ChartFactory,
    container,
    Dashboard,
    Message,
    SocialMediaFactory,
    SizingFactory,
    State,
    TagsContainer,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const notEmpty = Util.notEmpty;
    const socialCol = document.getElementById('social-tab-scroll');
    const socialFactory = SocialMediaFactory;
    const TABS = { tweets: false, news: false, blog: false, board: false, review: false, video_comment: false, financial: false };
    const TOTAL_LIMIT = 15;
    let LIMIT_REACHED = false;
    let TERM_STRINGS = '';
    let PARAMS = {};
    let CHART_CLICKED = false;
    let START_EPOCH;
    let END_EPOCH;

    ////////////////////////////////////////////////////////////////////////////
    const pluckId = R.prop('term_id');

    const incidenceType = (graphFrequency) => graphFrequency ? 'incidences' : 'mentions';

    const deactivateTabs = () => {
        this.activeTabs.tweets = false;
        this.activeTabs.news = false;
        this.activeTabs.blog = false;
        this.activeTabs.board = false;
        this.activeTabs.review = false;
        this.activeTabs.video_comment = false;
        this.activeTabs.financial = false;
        return this.activeTabs;
    };

    const deselect = R.map(R.assoc('active', false));

    const select = (tabs, stream) => {
        const deselected = deselect(tabs);
        const lens = R.lens(R.prop(stream), R.assoc(stream));
        return R.over(lens, R.assoc('active', true), deselected);
    };

    const resetTabScroll = (tab) => PARAMS[tab].div.scrollTop = 0;

    const requestDomains = (type) => {
        this.hideDomainFilters();
        this.filters[type] = true;
        return ApiFactory.getDomains(type, TERM_STRINGS, START_EPOCH, END_EPOCH).then((res) => {
            this['domain_'+type] = res.domains;
            this['total_domain_'+type] = res.total;
            return res;
        });
    };

    const emptyStreams = () => {
        this.streamsData.tweets = [];
        this.streamsData.news = [];
        this.streamsData.blog = [];
        this.streamsData.board = [];
        this.streamsData.review = [];
        this.streamsData.video_comment = [];
        this.streamsData.financial = [];
        return this.streamsData;
    };

    const finalSpamCheck = (twitter) => {
        if (twitter.status) {
            if (twitter.status === 500) {
                const errMsg = 'An error occured while fetching Tweets, try again later.';
                console.error(errMsg);
                Message.failure(errMsg)
            }
        }
        const ids = twitter.tweets.map((tweet) => tweet['id']);
        return ApiFactory.getTweetSpam(ids).then((spamData) => {
            // http://stackoverflow.com/questions/40270175/how-to-convert-this-each-function-that-adds-a-key-to-each-object-into-ramda/40270853#40270853
            const spammedTweets = R.zipWith(R.assoc('spam'), spamData, twitter.tweets);
            const tweetsContainer = [];
            PARAMS['tweets'].total = twitter.tweets_rows;
            this.streamsData.tweets = R.forEach(socialFactory.setTweetSentiment(tweetsContainer), spammedTweets);
            return this.streamsData.tweets;
        });
    };

    const processTwitter = (twitter) => notEmpty(twitter.tweets) ? finalSpamCheck(twitter) : emptyStreams();

    const processNonTwitter = (type, social) => {
        const ids = social.articles.map((article) => article['id']);

        if (notEmpty(social.articles)) {

            return ApiFactory.getArticleSpam(ids).then((spamData) => {
                const spammedArticles = R.zipWith(R.assoc('spam'), spamData, social.articles);
                this.streamsData[type] = spammedArticles;
                PARAMS[type].total = social.articles_rows;
                return this.streamsData[type];
            });

            // const streamData = R.clone(this.streamsData[type]);
            // this.streamsData[type] = streamData.concat(social.articles);
            // PARAMS[type].total = social.articles_rows;
            // return this.streamsData[type];
        }
        else {
            this.zeroData = true;
            socialFactory.clearSocialContent(type);
            this.socialTabApi.clearStream();
            return [];
        }
    };

    const setRetweetValue = (type) => type === 'tweets' ? socialFactory.twitterValues.twitter_retweet ? 1 : 0 : null;

    const setLinkValue = (type) => type === 'tweets' ? socialFactory.twitterValues.twitter_links ? 1 : 0 : null;

    const fetchStream = (domain, type, ticker = this.ticker, start = 0, limit = 15, start_epoch = null, end_epoch = null) => {
        const retweet = setRetweetValue(type);
        const link = setLinkValue(type);
        this.zeroData = false;

        if (start === 0) this.streamsData[type] = [];

        return ApiFactory.getSocial(type, TERM_STRINGS, ticker, start, limit, start_epoch, end_epoch, retweet, link, domain).then((social) => {
            return type === 'tweets' ? processTwitter(social) : processNonTwitter(type, social);
        });
    };

    const returnFetchStream = (type) => {
        if (CHART_CLICKED) {
            return fetchStream(null, type, this.ticker, PARAMS[type].start, PARAMS[type].limit, this.startDate, this.timespan, 'scroll');
        } else {
            return fetchStream(null, type, this.ticker, PARAMS[type].start, PARAMS[type].limit, START_EPOCH, END_EPOCH, 'scroll');
        }
    };

    const iterateParamsFetchMore = (type) => {
        const paramsType = PARAMS[type];
        if ((paramsType.start + paramsType.limit) < paramsType.total) {
            paramsType.start += paramsType.limit;
            const type = socialFactory.getStreamValue(this.activeTabs);
            return returnFetchStream(type);
        }
        else {
            return Promise.resolve();
        }
    };

    const sendStreamOut = (type = socialFactory.getStreamValue(this.activeTabs)) => {
        const content = socialFactory.switchSocialStream(type, this.streamsData[type]);
        this.loading = false;
        this.zeroData = false;
        this.socialTabApi.setStream(content);
        return Promise.resolve(content);
    };

    const loadMore = () => {
        this.loading = true;
        const type = socialFactory.getStreamValue(this.activeTabs);
        iterateParamsFetchMore(type).then(() => sendStreamOut(type));
    };

    const loadFinished = (streamType) => sendStreamOut(streamType);

    const reachedBottom = () => socialCol.scrollHeight - socialCol.scrollTop === socialCol.offsetHeight;

    const maxlimitCheck = (content) => content.length >= TOTAL_LIMIT;

    const checkScrollLimit = (type) => {
        if (!LIMIT_REACHED) {
            const content = socialFactory.getSocialStream();
            maxlimitCheck(content.data) ? loadMore() : LIMIT_REACHED = true;
        }
    };

    const scrollingSocial = () => reachedBottom() ? checkScrollLimit($state.params.stream) : null;

    const buildStream = (start_epoch, end_epoch, streamType, domain) => {
        const params = socialFactory.getStreamParams(start_epoch, end_epoch, TERM_STRINGS, this.activeTabs);
        return fetchStream(domain, streamType, params.ticker, params.start, params.limit, start_epoch, end_epoch);
    };

    const toggleActiveTab = (tab) => this.activeTabs[tab] = true;

    const getActiveTab = () => {
        const keys = Object.keys(this.activeTabs);
        const selected = keys.filter((key) => this.activeTabs[key]);
        return selected[0];
    };

    const showZero = () => {
        this.loading = false;
        this.zeroData = true;
    };

    const startLoad = (start, end, streamType = $state.params.stream, domain = null) => {
        this.loading = true;
        return buildStream(start, end, streamType, domain).then((streams) => {
            return R.isEmpty(streams[getActiveTab()])
                ? Promise.resolve(showZero())
                : loadFinished(streamType).then((content) => {
                    if (R.isEmpty(content.data)) showZero();
                    return Promise.resolve(content.data);
                });
        });
    };

    this.callStartLoad = (start_epoch, end_epoch, links, retweets) => {
        // startLoad(start, end);
        $state.go('container.dashboard.tickers.tags.activity', { start_epoch, end_epoch, links, retweets });
    };

    const updateParams = R.compose(socialFactory.generateParams, socialFactory.createMediaArray, socialFactory.getStreamValue);

    const setActiveTab = (activeTabs, stream) => {
        if(R.isNil(stream)) throw new Error('stream cannot be undefined or empty');
        activeTabs[stream] = true;
        return activeTabs;
    };

    this.setDomain = (domain) => {
        this.hideDomainFilters();
        this.loading = true;
        socialFactory.setClearContentFlag(true);
        startLoad(START_EPOCH, END_EPOCH, $state.params.stream, domain);
    };

    this.displaySocialHelp = () => $uibModal.open(socialMediaHelp);

    this.expandSocialPanel = () => {
        this.expandSocial = !this.expandSocial;
        this.expandTall = this.expandSocial;
    };

    this.toggleFreqMentions = (type) => {
        this.graphFrequency = type === 'incidences';
        const social = incidenceType(this.graphFrequency);
        TagsContainer.setVolType(social);
        ChartFactory.rangeType(type);
        $state.go('container.dashboard.tickers.tags.activity', { social });
    };

    this.hideDomainFilters = () => this.filters = R.map(R.complement(R.T), this.filters);

    this.toggleDomainFilter = (type) => requestDomains(type);

    this.socialTabClick = (type) => {
        this.loading = true;
        socialFactory.clearSocialContent(type);
        select(type);
        Dashboard.set('social', type);
        emptyStreams();
        deactivateTabs();
        toggleActiveTab(type);
        PARAMS = updateParams(this.activeTabs);
        this.hideDomainFilters();
        resetTabScroll(type);
        ChartFactory.setDataType(type);
    
        this.hasTags
            ? startLoad(START_EPOCH, END_EPOCH, type).then(() => $state.go('container.dashboard.tickers.tags.activity', { stream: type }))
            : this.loading = false;
    };

    this.$onInit = () => {
        // console.log('social_media', $state.params);
        socialCol.addEventListener('scroll', scrollingSocial);
        
        const tabs = {
            tweets: { tab: 'tweets', title: 'Twitter', active: true },
            news: { tab: 'news', title: 'News', active: false },
            blog: { tab: 'blog', title: 'Blog', active: false },
            board: { tab: 'board', title: 'Boards', active: false },
            review: { tab: 'review', title: 'Reviews', active: false },
            video_comment: { tab: 'video_comment', title: 'Video Comments', active: false },
            financial: { tab: 'financial', title: 'Financial', active: false }
        };

        this.activeTabs = setActiveTab(TABS, $state.params.stream);
        this.tabs = select(tabs, $state.params.stream);
        this.streamsData = { tweets: [], news: [], blog: [], board: [], review: [], video_comment: [], financial: [] };
        this.filters = { news: false, blog: false, board: false, review: false, video_comment: false, financial: false };

        this.tagsOpen = $state.params.tags_open;
        this.feedOpen = $state.params.feed_open;
        this.chartMax = $state.params.chart_max;

        START_EPOCH = $state.params.start_epoch;
        END_EPOCH = $state.params.end_epoch;
        this.hideSocial = false;
        this.zeroData = true;
        this.expandSocial = false;
        this.expandTall = false;
        this.leftZero = false;
        this.leftZero = !this.tagsOpen; // If Tags closed, left is 0
        this.right230 = this.feedOpen;  // If Feed open, right is 230
        this.hideSocial = this.chartMax;
        this.container = container;
        this.hasTags = !!this.container.length;
        this.graphFrequency = $state.params.social === 'mentions' ? 'mentions' : 'incidences';
        this.dataDescription = this.graphFrequency === 'mentions' ? 'Charting absolute tag mention volume' : 'Charting tag mentions per 100 million';

        SizingFactory.setSize('social-media-panel', this.tagsOpen, this.feedOpen);
        socialFactory.clearSocialContent($state.params.stream);

        TERM_STRINGS = this.container.map(pluckId).join(',');
        PARAMS = updateParams(this.activeTabs);

        if (this.hasTags) {
            this.loading = true;
            startLoad(START_EPOCH, END_EPOCH, $state.params.stream).then(() => {
                this.loading = false;
            })
        }
    };
}