////////////////////////////////////////////////////////////////////////////////
/**
* @name tagsHover (used in tagsPanel, viewHeader, searchPopover)
* @namespace Component
* @desc Displays additional tag details and actions on tag ticker_hover
*/
import template from './ticker_hover.html';

module.exports = angular
    .module('tickertags-tickers')
    .controller('TickerHover', TickerHover)
    .component('tickerHover', {
        template,
        replace: true,
        controller: 'TickerHover as tkhov',
        bindings: {
            ticker: '<',
            portfolio: '<',
            onRemove: '&'
        }
    });

TickerHover.$inject = [
    '$scope',
    'ApiFactory',
    'Message',
    'Util'];

function TickerHover(
    $scope,
    ApiFactory,
    Message,
    Util) {

    //////////////////////////////////////////////////////////////////////////
    this.removeTicker = () => {
        return ApiFactory.deletePortfolioTickers(this.portfolio.id, this.ticker.ticker).then((res) => {
            this.onRemove({
                ticker: this.ticker
            });
            Message.success(`${this.ticker.ticker} removed!`);
        });
    };

    this.$onInit = () => {
        if (this.portfolio) {
            this.ticker_remove = true;
        }
    };

    $scope.$watchCollection(() => this.ticker.hoverDisplay, _.debounce(() => {
        if (this.ticker.hoverDisplay) {
            if (this.ticker.ticker === 'SPY') this.isSpy = true;
            return ApiFactory.getTickerDetails(this.ticker.ticker).then((tickers) => {
                if (Util.notEmpty(tickers)) {
                    if (R.head(tickers).longname) this.ticker.longname = R.head(tickers).longname;
                    if (R.head(tickers).current_ask) this.ticker.current_ask = R.head(tickers).current_ask;
                }
                else {
                    this.ticker.hoverDisplay = false;
                }
            });
        }
    }, 300));
}