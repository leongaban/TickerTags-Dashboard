// @flow
////////////////////////////////////////////////////////////////////////////////
/**
 * @name ApiFactory
 * @namespace Factories
 * @desc Application wide REST APIS
 */

module.exports = angular
    .module('tickertags-shared')
    .factory('ApiFactory', factory);

factory.$inject = [
    '$http',
    'api',
    'Message'];

function factory(
    $http,
    api,
    Message) {

    const apiError = (error, message = 'Error occurred during request') => {
        console.log(
            `Api Error:
            url: ${error.config.url}
            message: ${message}`);
        return error;
    };

    // User Auth ///////////////////////////////////////////////////////////////
    const addUser = (creds) => {
        const post_data = {
            active: 0,
            username: creds.email,
            firstname: creds.firstname,
            lastname: creds.lastname,
            password: creds.password,
            role: 'Retail',
            role_id: 5
        };

        return $http.post(api.retail, post_data).then((res) => {
            if (res.status === 200) {
                return res.data.user;
            }
            else if (res.status === 400) {
                return null;
            }
            else {
                return Promise.reject();
            }
        });
    };

    const userLogin = (usr, pass) => {
        const post_data = { username: usr, password: pass };
        return $http.post(api.login, post_data);
    };

    const userPasswordReset = (email) => $http.delete(api.passwordReset +email).then((res) => res.data.status).catch(apiError);

    const userPasswordChange = (credentials) => $http.put(api.passwordChange , credentials).then((res) => res.data.status).catch(apiError);

    const checkPassword = (credentials) => $http.post(api.passwordCheck, credentials).then((res) => res.data.password_correct).catch(apiError);

    const userSettingsSave = (user) => {
        const post_data = {
            user_id          : user.user_id,
            feed_panel       : user.feed_panel,
            include_links    : user.include_links,
            include_retweets : user.include_retweets,
            twitter_graph    : user.twitter_graph,
            tag_filter       : user.tag_filter,
            social_current   : user.social_current,
            social_display   : user.social_display
        };

        return $http.post(api.userSettings, post_data).then((res) => res).catch(apiError);
    };

    const retrieveUserSettings = () => $http.get(api.userSettings).then((res) => res.data).catch(error => {
       apiError(error);
       return null;
    });

    ////////////////////////////////////////////////////////////////////////////
    const buildUrlParams = (ticker, term_id, vote_ticker, start, limit, start_epoch, end_epoch, media_type, retweet, link, domain) => {
        const params = {
            ticker,
            term_id,
            vote_ticker,
            start,
            limit,
            start_epoch,
            end_epoch,
            media_type,
            retweet,
            domain,
            link
        };

        const url_params = [];

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                if (params[key] !== null && params[key] !== undefined) {
                    url_params.push(key + '=' + params[key]);
                }
            }
        }

        return url_params.join('&');
    };

    const getArticleSpam = (ids) => {
        return $http.get(api.articleSpam + '?ids=' + ids).then((data) => data.data.spam).catch(apiError);
    };

    const articleSpam = (article) => {
        return $http.post(api.articleSpam, article).catch(apiError);
    };

    const tweetSpam = (tweet) => {
        return $http.post(api.twitterSpam, tweet).catch(apiError);
    };

    const getTweetSpam = (ids) => {
        return $http.get(api.twitterSpam + '?ids=' + ids).then((data) => data.data.spam).catch(apiError);
    };

    const insightSubmit = (data) => $http.post(api.insights, data).then((res) => res.data).catch(apiError);

    const insightPDF = (info) => {
        console.log('insightPDF', info);
        const config = { headers: { 'Content-Type' : 'application/json' } };
        return $http.post(api.insightsPdf, info, config).then((res) => res).catch(apiError);
    };

    const getPDF = (insight_id, pdf_id) => {
        const config = {
            params: { insight_id, pdf_id }
        };
        return $http.get(api.insightsPdf, config).then((res) => res).catch(apiError);
    };

    const alertSubmit = (data) => $http.post(api.termtrend, data).then((res) => res.data).catch(apiError);

    const submitNotification = (params) => $http.put(api.termtrend, params)
        .then((res) => res.data)
        .catch(error => {
            Message.failure('Error occurred when approving alert. Contact Administrator ');
            return apiError(error);
    });

    const retrieveTagSearchResults = (string) => {
        return $http.get(api.tagSearch+string+'&limit=20', { cache: true }).then((res) => res.data.ticker_tags).catch(apiError);
    };

    const getTweetVolume = (term_id, config) => {
        return $http.get(api.twitterVolume +term_id, config).then((res) => {
            return res.data;
        }).catch(apiError);
    };

    const getOtherVolume = (media_id, config = {}) => $http.get(api.newsVolume +media_id, config).then((res) => res.data).catch(apiError);

    const articleVote = (ticker, article_id, term_id, vote) => {
        const url  = api.news + ticker + '/' + article_id;
        const data = { 'term_id': term_id, 'vote': vote };
        return $http.put(url, data).catch(apiError);
    };

    const tweetVote = (ticker, tweet_id, term_id, vote) => {
        const url  = api.twitterSocial + ticker + '/' + tweet_id;
        const data = { term_id, vote };
        return $http.put(url, data).catch(apiError);
    };

    // const tweetScore = (ticker, tweet_id, term_id, score) => {
    //     const url  = api.twitterSocial + ticker + '/' + tweet_id;
    //     const data = { 'term_id': term_id, 'score': score };
    //     return $http.put(url, data).catch(apiError);
    // };

    const getTweetQuotes = (ticker) => $http.get(api.quotes +ticker).catch(apiError);

    // Social stream domains ///////////////////////////////////////////////////
    const getDomains = (stream_type, term_id, start_epoch, end_epoch) => {
        const url_params = buildUrlParams(null, term_id, null, null, null, start_epoch, end_epoch, stream_type);
        const url = api.newsDomain + url_params;
        return $http.get(url).then(res => res.data).catch(apiError);
    };

    const createFinancialUrl = (term_id, vote_ticker, start, limit, start_epoch, end_epoch, retweet, link, domain) => {
        let url;
        if (start_epoch && !domain) {
            url = api.news+vote_ticker+'/'+term_id+'?media_type=financial&start_epoch='+start_epoch+'&end_epoch='+end_epoch;
        } else if (domain) {
            const url_params = buildUrlParams(vote_ticker, term_id, null, start, limit, start_epoch, end_epoch, 'financial', null, null, domain);
            url = api.newsQuery +url_params;
        } else {
            url = api.news+vote_ticker+'/'+term_id+'?media_type=financial';
        }

        return url;
    };

    const getSocial = (stream_type, term_id, vote_ticker, start, limit, start_epoch, end_epoch, retweet, link, domain) => {
        const streamType = R.equals(stream_type, 'tweets') ? null : stream_type;
        const url_params = buildUrlParams(null, term_id, vote_ticker, start, limit, start_epoch, end_epoch, streamType, retweet, link, domain);
        let url;

        if (stream_type === 'tweets') {
            url = api.twitterSocialQuery +url_params;
        }
        else if (stream_type === 'financial') {
            url = createFinancialUrl(term_id, vote_ticker, start, limit, start_epoch, end_epoch, retweet, link, domain);
        }
        else {
            url = api.newsQuery +url_params;
        }

        return $http.get(url).then((res) => res.data).catch(apiError);
    };

    const postAlertSettings = (settingsObject) => $http.post(api.alertSettings, settingsObject);

    const retrieveAlerts = (params) => $http.get(api.alerts, { params }).then((res) => res.data).catch(apiError);

    const alertsChart = (params) => $http.post(api.alertsChart, params).then((res) => res).catch(apiError);

    const alertsVolume = (params) => $http.get(api.alertsVolume, { params }).then((res) => res.data.alerts).catch(apiError);

    const getViews = () => $http.get(api.views, { cache: false }).then((res) => res.data.views).catch(apiError);

    const saveView = (data) => {
        const post_data = {
            description : data.description,
            timespan    : data.timespan,
            ticker      : data.ticker,
            ticker_1    : data.ticker_1,
            term_id_1   : data.term_id_1,
            ticker_2    : data.ticker_2,
            term_id_2   : data.term_id_2,
            ticker_3    : data.ticker_3,
            term_id_3   : data.term_id_3,
            sort        : data.sort,
            start_epoch : data.start_epoch,
            end_epoch   : data.end_epoch
        };

        // console.log('post_data', post_data);

        return $http.post(api.views, post_data).then((res) => res.data.status).catch(apiError);
    };

    const deleteView = (view_id) => $http.delete(api.views+view_id).then((res) => res.data.status).catch(apiError);

    const postFavList = (id) => {
        const post_data = { term_id : id };
        return $http.post(api.favorites , post_data).then((res) => res.data.status).catch(apiError);
    };

    const getFavList = () => $http.get(api.favorites).then((res) => res).catch(apiError);

    const deleteFavList = (id) => $http.delete(api.favorites +id).then((res) => res.data.status).catch(apiError);

    const addCustomTag = (ticker, term, category, visibility) => {
        return $http.post(api.favorites + ticker, { term: term, tag: category, visibility: visibility })
            .then((res) => res).catch(apiError);
    };

    const getCategories = (ticker) => {
        return $http.get(api.categories+ticker, { cache:true }).then((res) => res.data.categories).catch(apiError);
    };

    const getTags = (ticker, params = null, optional = '') => {
        const cache = false;
        const args = [];

        if (params != null) {
            for (let option in params) {
                if (params[option] !== '') {
                    args.push(option + '=' + params[option]);
                }
            }
        }
        else {
            args.push(optional);
        }

        const url = api.tags+'?ticker='+ticker+'&'+args.join('&');
        return $http.get(url, { cache: cache }).then((res) => res.data).catch(apiError);
    };

    const getTagData = (ticker, term_id) => {
        const url = api.tags+'?ticker='+ticker+'&term_id='+term_id;
        return $http.get(url, { cache: true })
            .then((res) => res.data.ticker_tag).catch(apiError);
    };

    const getTagDataSlim = (term_id) => {
        const url = api.tagTerm+term_id;
        return $http.get(url, { cache: false }).then((res) => res.data.ticker_tag).catch(apiError);
    };

    const getTopTerms = (term_id, start_epoch, end_epoch) => {
        const url = api.topterms+term_id;
        return $http.get(url, { params: { start_epoch, end_epoch } }).then((res) => res.data.terms).catch(apiError);
    };

    const getTickers = (input = null, string = '') => {
        const args = [];
        let url = api.tickers;

        if (input != null) {
            for (let key in input) {
                if (input[key] !== '') {
                    args.push(key + '=' + input[key]);
                }
            }
            url += '?';
        }
        else {
            args.push(string);
        }

        return $http.get(url + args.join('&'), { cache: true }).then((res) => res.data.tickers).catch(apiError);
    };

    const getTickerDetails = (ticker) => {
        return $http.get(api.tickers+ '?ticker=' +ticker, { cache: false }).then((res) => res.data.tickers).catch(apiError);
    };

    const retrieveTickerPrice = (ticker, config = {}) => {
        const url = api.quotes + '?ticker=' + ticker;
        return $http.get(url, config).then((res) => res).catch(apiError);
    };

    // PORTFOLIOS //////////////////////////////////////////////////////////////

    // To be removed:
    // const getWatchList = (cache) => $http.get(api.portfolio, { cache: cache }).then((res) => res.data.tickers).catch(apiError);

    // To be removed (Used in search_component)
    // const postWatchList = (ticker) => {
    //     return $http.post(api.portfolio, { ticker: ticker }).catch(apiError);
    // };

    // To be removed (Used in tickers_factory and tickers_panel_ctrl)
    // const deleteWatchList = (ticker) => $http.delete(api.portfolio+'?ticker='+ticker).catch(apiError);

    const getPortfolios = () => $http.get(api.portfolio).then((res) => res.data).catch(apiError);

    const portfolioReport = (portfolio_id) => $http.post(api.portfolioReport, { portfolio_id}).catch(apiError);

    const deletePortfolio = (portfolio_id) => $http.delete(api.portfolio, { params: { portfolio_id } }).catch(apiError);

    const postPortfolioTickers = (tickers) => {
        const post_data = { tickers };
        return $http.post(api.portfolioTickers, post_data).catch(apiError);
    };

    const putPortfolioTickers = (portfolio_id, tickers) => {
        return $http.put(api.portfolioTickers, { portfolio_id, tickers }).catch(apiError);
    };

    const deletePortfolioTickers = (portfolio_id, ticker) => {
        const post_data = {
            params: {
                portfolio_id,
                ticker
            }
        };
        return $http.delete(api.portfolioTickers, post_data).catch(apiError);
    };

    const addToPortfolio = (portfolio_id, ticker) => {
        const post_data = {
            portfolio_id,
            tickers: [ticker]
        };
        return $http.put(api.portfolioTickers, post_data).catch(apiError);
    };

    const updatePortfolio = (portfolio) => {
        return $http.put(api.portfolio, {
            id: portfolio.id,
            name:portfolio.name,
            tickers: portfolio.tickers,
            frequency: portfolio.frequency,
            email_notification: portfolio.email_notification,
            data: portfolio.data
        }).then((res) => res.status).catch(apiError);
    };

    const createPortfolio = (name, tickers, frequency, email_notification=0, data={ source: 'twitter', fields:'incidence' }) => {
        const post_data = {
            name,
            tickers,
            frequency,
            email_notification,
            data
        };
        return $http.post(api.portfolio, post_data).catch(apiError);
    };
    ////////////////////////////////////////////////////////////////////////////

    const search = (search) => $http.get(api.tagSearch +search, { cache: true }).catch(apiError);

    const quotes = (url, config = { cache: true }) => $http.get(url, config).catch(apiError);

    const getReports = (ticker=null) => {
        return $http.get('/app/api/tickers/periods/web_reports', {params:{published: true, ticker}}).catch(apiError);
    };

    const vanityUrl = (state) => $http.post(api.vanity, { url: state })
        .then(response => response.data.vanity)
        .catch(apiError);

    const subscriptionRenew = () => $http.put(api.subscription)

    const subscription = (token) => $http.post(api.subscription, { token }).then(res => res.data.subscription).catch(console.error);

    const deleteSubscription = () => $http.delete(api.subscription, {}).then(res => res.data).catch(apiError);

    // Admin ///////////////////////////////////////////////////////////////////
    const importManageTickers = () => $http.post(api.bulkWatchList).then(res => res.data.tickers).catch(apiError);

    return {
        apiError,

        // User related ////////////////////////////////////////////////////////
        addUser,
        userLogin,
        userPasswordReset,
        userPasswordChange,
        checkPassword,
        userSettingsSave,
        retrieveUserSettings,

        getArticleSpam,
        articleSpam,
        tweetSpam,
        getTweetSpam,
        insightSubmit,
        insightPDF,
        getPDF,
        alertSubmit,
        submitNotification,
        retrieveTagSearchResults,
        getTweetVolume,
        getOtherVolume,
        articleVote,
        tweetVote,
        // tweetScore,
        getTweetQuotes,
        getSocial,
        getDomains,
        postAlertSettings,
        retrieveAlerts,
        alertsChart,
        alertsVolume,
        getViews,
        saveView,
        deleteView,
        postFavList,
        getFavList,
        deleteFavList,
        addCustomTag,
        getCategories,
        getTags,
        getTagData,
        getTagDataSlim,
        getTopTerms,
        getTickers,
        getTickerDetails,
        retrieveTickerPrice,
        // getWatchList,
        // postWatchList,
        // deleteWatchList,

        // Portfolios //////////////////////////////////////////////////////////
        getPortfolios,
        deletePortfolio,
        postPortfolioTickers,
        putPortfolioTickers,
        deletePortfolioTickers,
        addToPortfolio,
        updatePortfolio,
        createPortfolio,
        portfolioReport,
            
        search,
        quotes,
        getReports,
        vanityUrl,
        subscription,
        deleteSubscription,
        subscriptionRenew,

        importManageTickers
    }
}
