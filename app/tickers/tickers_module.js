////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-tickers
* @namespace The Tickers module
* @desc Encapsulates the Ticker related modules
*/
import tickersPanel from './tickers_panel/tickers_panel.html';
import tickersPanelController from './tickers_panel/tickers_panel_controller';

const _tickertags_tickers_module = angular.module('tickertags-tickers', ['ui.router'])

.config(['$stateProvider', function($stateProvider) {
    const tickers = {
        name: 'container.dashboard.tickers',
        views: {
            tickers: {
                template: tickersPanel,
                controller: tickersPanelController,
                controllerAs: 'tikp'
            }
        }
    };

	$stateProvider.state(tickers);
}]);

require("./tickers_factory");
require("./ticker_hover/ticker_hover_component");
require("../portfolios/portfolio_ticker/portfolio_ticker_component");

module.exports = _tickertags_tickers_module;