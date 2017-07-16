////////////////////////////////////////////////////////////////////////////////
/**
* @name searchPopover
* @namespace Components
* @desc Controls the main search popover, fuzzy search for Tickers and Tags
*/
import template from './search.html'

module.exports = angular
    .module('tickertags-search')
    .controller('SearchCtrl', SearchCtrl)
    .component('search', {
        template,
        controller: SearchCtrl,
        controllerAs: 'sc',
        transclude: true,
        bindings: {
            onTickerResult: '&',
            onTagResult: '&',
            onPortfolio: '&'
        }
    });

SearchCtrl.$inject = [
    '$state',
    'GetTagsContainer',
    'SearchFactory',
    'TagsContainer',
    'TickersFactory'];

function SearchCtrl(
    $state,
    GetTagsContainer,
    SearchFactory,
    TagsContainer,
    TickersFactory) {

    /////////////////////////////////////////////////////////////////////////////
    let SEARCHED_TAGS;

    const displayTickers = (tickers) => TickersFactory.searchedPortfolioCheck(tickers);

    const displayTags = (searched, favorites) => TagsContainer.favoriteCheck(searched, favorites);

    const clearTags = () => {
        this.tagsListLoaded = false;
        this.tagsList = [];
    };

    const refreshTags = () => {
        GetTagsContainer.getFavTags().then((favorites) => {
            this.tagsList = displayTags(SEARCHED_TAGS, favorites);
            this.tagsListLoaded = true;
        });
    };

    this.tickerTagSearch = (searched) => {
        this.init = true;
        return SearchFactory.on(searched).then((res) => {
            SEARCHED_TAGS = res.tags;
            this.tickersList = res.tickers ? displayTickers(res.tickers) : null;
            this.tickersListLoaded = true;
            
            GetTagsContainer.getFavTags().then((favorites) => {
                this.tagsList = displayTags(SEARCHED_TAGS, favorites);
                this.tagsListLoaded = true;
            });
        });
    };

    const updatePortfolio = (ticker, action) => {
        this.close();
        return this.onPortfolio({ ticker, action });
    };

    this.addTicker = (ticker) => {
        return TickersFactory.portfolioAdd(this.portfolio_id, ticker).then(() => {
            return updatePortfolio(ticker, 'add');
        });
    };

    this.removeTicker = (ticker) => {
        return TickersFactory.portfolioRemove(this.portfolio_id, ticker).then(() => {
            return updatePortfolio(ticker, 'remove');
        });
    };

    this.favTag = (tag) => {
        clearTags();
        TagsContainer.addFavorite(tag).then(refreshTags);
    };

    this.unFavTag = (tag) => {
        clearTags();
        TagsContainer.removeFavorite(tag).then(refreshTags);
    };

    this.close = () => {
        this.searched = '';
        this.init = false;
    };

    this.keyUp = (event) => event.key === 'Escape' ? this.close() : null;

    this.hoverTag = (tag) => tag.hoverDisplay = true;

    this.leaveTag = (tag) => tag.hoverDisplay = false;

    this.hoverTicker = (ticker) => ticker.hoverDisplay = true;

    this.leaveTicker = (ticker) => ticker.hoverDisplay = false;

    this.selectTicker = (ticker) => {
        this.close();
        this.onTickerResult({ticker});
    };
        // Promise.resolve(this.onTickerResult({
        //     ticker
        // }))
        // .then((res) => this.close());

    this.selectTag = (tag) => {
        this.close();
        this.onTagResult({tag});
    };
        // Promise.resolve(this.onTagResult({
        //     tag
        // })).then((res) => this.close());

    this.$onInit = () => {
        this.init = false;
        this.tickersList = [];
        this.tagsList = [];
        this.portfolio_id = $state.params.portfolio;
    };
}