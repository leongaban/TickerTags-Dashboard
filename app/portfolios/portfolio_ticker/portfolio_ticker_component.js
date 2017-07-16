import PortfolioTickerController from './portfolio_ticker_controller';
import template from './portfolio_ticker.html';

module.exports = angular
    .module('tickertags-tickers')
    .component('portfolioTicker', {
        template,
    	controllerAs: 'ptc',
    	controller: PortfolioTickerController,
    	bindings: {
    		index: '<',
    		ticker: '<',
    		onRemove: '&',
    		onUpdate: '&'
    	}
    });