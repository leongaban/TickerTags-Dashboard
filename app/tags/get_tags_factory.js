////////////////////////////////////////////////////////////////////////////////
/**
* @name GetTagsContainer
* @namespace Factories
* @desc Service to retrieve list of tags
*/

module.exports = angular
    .module('tickertags-tags')
    .factory('GetTagsContainer', factory);

factory.$inject = [
    '$state',
    'ApiFactory',
    'TagsContainer',
    'TimeSpanFactory',
    'Util'];

function factory(
    $state,
    ApiFactory,
    TagsContainer,
    TimeSpanFactory,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;

    const getTags = (ticker, params) => {
        const apiCallTags = (data) => {
            const time = $state.params.timespan;
            const tags = TagsContainer.updateTagKeys(null, data.ticker_tags, time);

            return Promise.resolve({
                array: tags,
                total: data.ticker_tags_rows
            });
        };

        if (R.isNil(params.order)) params.order = 'day_delta_epoch_desc';

        return ApiFactory.getTags(ticker, params).then(apiCallTags).catch(apiError);
    };

    const getFavTags = () => {
        const sort = $state.params.sort;

        const FAV_PARAMS = {
            favorite: 1,
            limit: 200,
            private: 0,
            start: 0,
            order: TimeSpanFactory.convertInterval(this.timespan, sort),
            search: '',
            tag: ''
        };

        return getTags(Util.encodeTicker($state.params.ticker), FAV_PARAMS).then((tags) => tags.array);
    };

    return {
        getTags,
        getFavTags
    }
}