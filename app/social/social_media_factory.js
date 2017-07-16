////////////////////////////////////////////////////////////////////////////////
/**
* @name Social Media factory
* @namespace Factories
* @desc HTML escaping for social streams
*/

module.exports = angular
    .module('tickertags-social')
    .factory('SocialMediaFactory', factory);

factory.$inject = [
    '$state',
    'ApiFactory',
    'Format'];

function factory(
    $state,
    ApiFactory,
    Format) {

    ////////////////////////////////////////////////////////////////////////////
    const socialStreamContent = {
        type: 'tweets',
        data: []
    };

    let clearContent = false;
    
    const socialmedia = new Map();
    socialmedia.set('timestamp', 0);
    socialmedia.set('chart', false);

    const twitterValues = {
        twitter_links   : false,
        twitter_retweet : false
    };

    const storeValues = (twitterLinks = false, twitterRetweets = false) => {
        twitterValues.twitter_links   = twitterLinks;
        twitterValues.twitter_retweet = twitterRetweets;
    };

    const getStreamValue = (socialTabs) => {
        const isTrue = R.equals(true);
        const activeTab = R.compose(R.head, R.keys, R.filter(isTrue));
        return activeTab(socialTabs);
    };

    const getStreamParams = (start_epoch, end_epoch, terms_strings, tabs) => {
        return {
            id: terms_strings,
            start: 0,
            limit: 15,
            start_epoch: start_epoch,
            end_epoch: end_epoch,
            value: getStreamValue(tabs)
        };
    };

    const loadMoreItems = (contentStream) => _.each(contentStream, (contentItem) => socialStreamContent.data.push(contentItem));

    const setClearContentFlag = (bool) => clearContent = bool;

    const clearSocialContent = (type) => {
        socialStreamContent.type = type;
        socialStreamContent.data = [];
    };

    const getSocialStream = () => socialStreamContent;

    const stringifyTermID = R.compose(R.toString, R.head);

    const getValues = () => twitterValues;

    // ToDo: Refactor this giant mess
    const formatContent = (tab, streams) => {
         _.map(streams, (stream) => {
            if (tab === 'tweets') {
                const userName = stream.user_name;
                const id = stream.id;
                const url = `http://twitter.com/${userName}/status/${id}`;
                let highlight = '';

                if (stream.highlight) {
                    highlight = Format.truncate(stream.highlight, 200);
                } else {
                    highlight = Format.truncate(stream.text, 200);
                }

                stream.link = url;
                stream.headline = stream.user_name;
                stream.date = stream.formatted_date_difference;
                stream.text = `${highlight}`;
            }
            else if (tab === 'news' || tab === 'blog' || tab === 'board' || tab === 'review' || tab === 'financial') {
                if (stream.highlight) {
                    stream.text = Format.truncate(stream.highlight, 200);
                } else {
                    stream.text = Format.truncate(stream.literal_content, 200);
                }
            }
            else if (tab === 'review') {
                stream.headline = stream.literal_item;
            }

            if (tab !== 'tweets') {
                const highlight = Format.truncate(stream.highlight, 200);
                stream.link = stream.url;
                stream.headline = Format.truncate(stream.title, 200);
                stream.text = `${highlight}`;
                stream.date = stream.formatted_date;
            }
        });
        return streams;
    };

    const switchSocialStream = (type, contentStream) => {
        if (clearContent) {
            clearSocialContent();
            clearContent = false;
        }

        socialStreamContent.type = type;
        const formattedStream = formatContent(type, contentStream);
        loadMoreItems(formattedStream);
        return socialStreamContent;
    };

    const createTweetData = (content, state) => {
        return {
            spam: state,
            tweet_id: content['id'],
            retweet: Number(content['retweet']),
            start_epoch: content['start_epoch'],
            username: content['user_name'],
            text: content['text']
        };
    };

    const createNonTweetData = (content, state) => {
        return {
            spam: state,
            article_id: content['id'],
            content: content['content'],
            domain: content['domain'],
            title: content['title'],
            url: content['url'],
            type: socialStreamContent.type,
            start_epoch: content['start_epoch']
        }
    };

    const spamStatus = (content, state) => {
        content.spam = state;

        let data = {};

        const isTweet = content.username;
        console.log('isTweet', isTweet)

        data = isTweet ? createTweetData(content, state) : createNonTweetData(content, state);
        return isTweet ? ApiFactory.tweetSpam(data) : ApiFactory.articleSpam(data);

        // If Tweet
        // if (content.username) {
        //     data = {
        //         spam: state,
        //         tweet_id: content['id'],
        //         retweet: Number(content['retweet']),
        //         start_epoch: content['start_epoch'],
        //         username: content['user_name'],
        //         text: content['text']
        //     };

        //     return ApiFactory.tweetSpam(data);
        // }
        // // Non Tweet
        // else {
        //     data = {
        //         spam: state,
        //         article_id: content['id'],
        //         content: content['content'],
        //         domain: content['domain'],
        //         title: content['title'],
        //         url: content['url'],
        //         type: socialStreamContent.type,
        //         start_epoch: content['start_epoch']
        //     }

        //     return ApiFactory.articleSpam(data);
        // }
    };

    // If more than 1 term_id, concat string with "," :
    const getTermIds = (ids) => ids.length > 1 ? ids.join(', ') : stringifyTermID(ids);

    const thumbVotes = (item, score) => {
        item.vote = score;
        const ticker = $state.params.ticker;
        const term_ids = getTermIds(item.term_ids);

        if ('domain' in item) {
            ApiFactory.articleVote(ticker, item.id, term_ids, score);
        } else {
            ApiFactory.tweetVote(ticker, item.id, term_ids, score);
        }
    };

    const scoreSentiment = (item, score) => {
        item.vote = score;
        const ticker = $state.params.ticker;
        const term_ids = getTermIds(item.term_ids);
        // return ApiFactory.tweetScore(ticker, item.id, term_ids, item.vote);
        return ApiFactory.tweetVote(ticker, item.id, term_ids, score);
    };

    const createMediaArray = (stream) => {
        const media = [];
        media.push(stream);
        return media;
    };

    const generateParams = (media) => {
        const paramObj = {};
        _.each(media, function(value, i) {
            paramObj[media[i]] = {};
            paramObj[media[i]].start = 0;
            paramObj[media[i]].limit = 15;
            paramObj[media[i]].total = 0;
            paramObj[media[i]].div = document.getElementById('social-tab-scroll');
        });
        return paramObj;
    };

    // from http://widgets.twimg.com/j/1/widget.js
    const K = function () {
        const a = navigator.userAgent;
        return { ie: a.match(/MSIE\s([^;]*)/) };
    }();

    const parseTwitterDate = (tdate) => {
        const user_date = new Date();
        let system_date = new Date(Date.parse(tdate));
        if (K.ie) system_date = Date.parse(tdate.replace(/( \+)/, ' UTC$1'));
        const diff = Math.floor((user_date - system_date) / 1000);
        if (diff <= 1)      { return "just now"; }
        if (diff < 20)      { return diff + " seconds ago"; }
        if (diff < 40)      { return "half a minute ago"; }
        if (diff < 60)      { return "less than a minute ago"; }
        if (diff <= 90)     { return "one minute ago"; }
        if (diff <= 3540)   { return Math.round(diff / 60) + " minutes ago"; }
        if (diff <= 5400)   { return "1 hour ago"; }
        if (diff <= 86400)  { return Math.round(diff / 3600) + " hours ago"; }
        if (diff <= 129600) { return "1 day ago"; }
        if (diff < 604800)  { return Math.round(diff / 86400) + " days ago"; }
        if (diff <= 777600) { return "1 week ago"; }
        return "on " + system_date;
    };

    const setTweetSentiment = R.curry((container, tweet) => {
        if (tweet.hasOwnProperty('sentiment')) {
            tweet.sentiment = tweet.sentiment * 1000;
            tweet.sentiment = Math.round(tweet.sentiment);
            tweet.sentiment = tweet.sentiment / 100;
        }
        tweet.formatted_date_difference = parseTwitterDate(tweet.date);
        container.push(tweet);
        return container;
    });

    ////////////////////////////////////////////////////////////////////////////
    return {
        twitterValues,
        socialmedia,
        getStreamParams,
        setClearContentFlag,
        clearSocialContent,
        switchSocialStream,
        getSocialStream,
        storeValues,
        getValues,
        formatContent,
        thumbVotes,
        spamStatus,
        scoreSentiment,
        getStreamValue,
        createMediaArray,
        generateParams,
        setTweetSentiment
    }
}