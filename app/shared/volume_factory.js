////////////////////////////////////////////////////////////////////////////////
/**
 * @name Volume
 * @namespace Factories
 * @desc Service to handle Models
 */

module.exports = angular
    .module('tickertags-shared')
    .factory('Volume', factory);

factory.$inject = [
    '$state',
    'Format',
    'ApiFactory',
    'ChartFactory'
];

function factory(
    $state,
    Format,
    ApiFactory,
    ChartFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    const map = R.map;
    const compose = R.compose;
    const prop = R.prop;

    const selectIncidence = (isSentiment) => {
        if (isSentiment) {
            return 'incidence_non_retweet_non_promo';
        }
        
        const links   = $state.params.links;
        const retweet = $state.params.retweets;

        if      (links  && retweet)  { return 'incidence'; }
        else if (!links && retweet)  { return 'incidence_non_promo'; }
        else if (links  && !retweet) { return 'incidence_non_retweet'; }
        else                         { return 'incidence_non_retweet_non_promo'; }
    };

    const castNumber = (type) => type === undefined || type === null || isNaN(type) ? 0 : type;

    const Ticker = (ticker, params) => {
        const _params = _.omit(params, 'data_type');
        const success = (response) => _.map(response.data.quotes, (quote) => quote);
        return ApiFactory.retrieveTickerPrice(ticker, { params: _params }).then(success);
    };

    const Tag = (name, term_id, params, mediaType = 'tweets', isSentiment) => {
        const incidenceFlag = selectIncidence(isSentiment);

        const returnTweets = () => {
            const data_type = { data_type: 'incidence' };
            const _params   = _.merge(params, data_type);
            return ApiFactory.getTweetVolume(term_id, {
                params: _params,
                cache: false
            })
            .then((social) => {
                const normIncidence = compose(Format.frequencyMultipler, prop(incidenceFlag));
                const mentions = Format.mentions(social, incidenceFlag);
                const frequencyCounts = prop('frequency_counts', social);
                const incidences = map(normIncidence, frequencyCounts);

                const positive = frequencyCounts.map(prop('incidence_positive_sentiment'));
                const negative = frequencyCounts.map(prop('incidence_negative_sentiment'));
                const sentiment_incidence = frequencyCounts.map(prop('incidence_non_retweet_non_promo'));

                const start_epoch = map(prop('start_epoch'), frequencyCounts);

                return {
                    term_id: term_id,
                    name: name,
                    mentions: mentions,
                    incidences: incidences,
                    negative,
                    positive,
                    start_epoch: start_epoch,
                    sentimentIncidence: sentiment_incidence,
                    sentiment: true
                }
            })
            .catch(apiError);
        };

        const returnSocialFrequency = (social) => {
            const frequencyCounts = prop('frequency_counts', social);
            const normIncidence = compose(Format.frequencyMultipler, prop('incidence'));
            const mentions = Format.mentions(social, 'incidence');
            const incidences = map(normIncidence, frequencyCounts);
            const positive = frequencyCounts.map(prop('incidence_positive_sentiment'));
            const negative = frequencyCounts.map(prop('incidence_negative_sentiment'));

            const sentiment_incidence = frequencyCounts.map(prop('incidence'));

            const start_epoch = map(prop('start_epoch'), frequencyCounts);

            return {
                term_id: term_id,
                name: name,
                mentions: mentions,
                incidences: incidences,
                positive,
                negative,
                sentimentIncidence: sentiment_incidence,
                start_epoch: start_epoch,
                sentiment: true
            }
        };

        const returnSocialMentions = (social) => {
            const mentions    = R.map(R.prop('articles'),    social.frequency_counts);
            const start_epoch = R.map(R.prop('start_epoch'), social.frequency_counts);

            return {
                name: name,
                mentions: mentions,
                start_epoch: start_epoch,
                sentiment: false
            }
        };

        const returnSocial = () => {
            delete params['limit'];
            params.media_type = mediaType;

            const chartDataType = ChartFactory.getRangeType();

            if (chartDataType === 'incidences') {
                params.data_type = 'incidence';
                return ApiFactory.getOtherVolume(term_id, { params: params, cache: false }).then(returnSocialFrequency);
            }
            else {
                params.data_type = 'mentions';
                return ApiFactory.getOtherVolume(term_id, { params: params, cache: false }).then(returnSocialMentions);
            }
        };

        return mediaType === 'tweets' ? returnTweets() : returnSocial();
    };

    return {
        selectIncidence,
        Ticker,
        Tag
    };
}