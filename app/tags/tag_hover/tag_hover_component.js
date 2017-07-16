////////////////////////////////////////////////////////////////////////////////
/**
 * @name tagHoverComponent
 * @namespace Component
 * @desc Element Commponent and Controller for the TagsHover
 */
import template from './tag_hover.html';

module.exports = angular
    .module('tickertags-tags')
    .component('tagHover', {
        template,
        controller: TagHoverController,
		controllerAs: 'tghov',
        bindings: {
            tag: '<'
        }
    });

TagHoverController.$inject = [
    '$q',
    '$scope',
    '$state',
    'ApiFactory',
    'State',
    'TagsContainer',
    'TickersFactory'
];

function TagHoverController(
    $q,
    $scope,
    $state,
    ApiFactory,
    State,
    TagsContainer,
    TickersFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.$onInit = () => {
		this.lotsOfTags = false;
        this.loadingTickers = true;
    };

    this.hoverTicker = (ticker) => ticker.hoverDisplay = true;

    this.leaveTicker = (ticker) => ticker.hoverDisplay = false;

    this.selectTicker = (ticker) => State.go('.tickers.tags.activity', { ticker: ticker.ticker });

    this.addFavorite = () => TagsContainer.addFavorite(this.tag);

    this.removeFavorite = () => TagsContainer.removeFavorite(this.tag);
    
    // Watches /////////////////////////////////////////////////////////////////
    $scope.$watchCollection(() => this.tag.hoverDisplay, _.debounce(() => {
        const timespan = $state.params.timespan;
        if (this.tag.hoverDisplay) {

            // const request = {
            //     tickerTag: ApiFactory.getTagDataSlim(this.tag.term_id),
            //     topTerms: ApiFactory.getTopTerms(this.tag.term_id, $state.params.start_epoch, $state.params.end_epoch)
            // };

            // $q.all(request).then((response) => {
            //     const { tickerTag, topTerms } = response;
            // });

            ApiFactory.getTagDataSlim(this.tag.term_id).then((tickerTag) => {
                this.hideCategory  = $state.params.ticker === "SPY";
                this.tag.category  = tickerTag.tag;
                this.tag.favorite  = tickerTag.favorite;
                this.tag.isMillion = tickerTag.isMillion;
                this.tag.tickers   = tickerTag.tickers;
                this.tag.tickers   = R.map(TickersFactory.objectifyTicker, tickerTag.tickers);
                this.loadingTickers = false;
                if (R.length(tickerTag.tickers) > 12) this.lotsOfTags = true;
                return tickerTag;
            }).then(() => {
                this.tag.gettingTop = true;
                ApiFactory.getTopTerms(this.tag.term_id, $state.params.start_epoch, $state.params.end_epoch).then((topTerms) => {
                    this.tag.top_terms = topTerms;
                    this.tag.hasTopTerms = this.tag.top_terms.length > 1;
                    this.tag.gettingTop = false;
                });
            })
        }
    }, 300));
}