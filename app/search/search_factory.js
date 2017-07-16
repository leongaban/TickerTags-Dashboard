////////////////////////////////////////////////////////////////////////////////
/**
* @name SearchFactory
* @namespace Factories
* @desc Factory that inits the SearchComponent for mainSearch or feedSearch 
*/

module.exports = angular
    .module('tickertags-search')
    .factory('SearchFactory', factory);

factory.$inject = [
    '$q',
    'ApiFactory',
    'Format',
    'TagsContainer'];

function factory(
    $q,
    ApiFactory,
    Format,
    TagsContainer) {

    ////////////////////////////////////////////////////////////////////////////
    const on = (searched) => {
        const word = Format.encodeURI(searched);
        const load = "?search="+word+"&limit=50&start=0";
        const tickers = ApiFactory.getTickers(null, load);
        const tags = word !== "%24" && word.length > 2 ? ApiFactory.retrieveTagSearchResults(word).then((ticker_tags) => {
            return TagsContainer.updateTagKeys('fuzzy', ticker_tags);
        }) : [];

        return $q.all({ tickers, tags });
    };

    return {
        on
    }
}