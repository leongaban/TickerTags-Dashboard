////////////////////////////////////////////////////////////////////////////////
/**
 * @name tickersFactory
 * @namespace Factories
 * @desc Stores the global ticker and ticker type
 */

module.exports = angular
    .module('tickertags-tickers')
    .factory('TickersFactory', factory);

factory.$inject = [
    'ApiFactory',
    'Message',
    'Util'];

function factory(
    ApiFactory,
    Message,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    let WATCHLIST;
    let PORTFOLIOS;
    let PORTFOLIO_TICKERS = [];
    let addedTicker;

    const sortTickers = Util.sortByKey;
    const tickerContainer = {
        ticker: { ticker: 'SPY' }
    };

    const chartIsReady = false;

    // http://stackoverflow.com/questions/1199352/smart-way-to-shorten-long-strings-with-javascript
    String.prototype.trunc = String.prototype.trunc ||
        function(n) {
            return (this.length > n) ? this.substr(0,n-1)+'...' : this;
        };

    const orderAlpha = (tickers) => sortTickers(tickers, 'ticker');

    const noTickersMsg = (tickers) => tickers.length === 0;

    const truncate = (ticker) => {
        const symbol = ticker.ticker;
        const truncatedTicker = R.clone(ticker);
        truncatedTicker.long = symbol;
        truncatedTicker.short = symbol.trunc(8);
        return truncatedTicker;
    };

    const checkTickerLength = (ticker) => {
        const symbol = R.prop('ticker', ticker);
        const long   = R.gt(R.length(symbol), 8);
        return long ? truncate(ticker) : ticker;
    };

    const truncateLongTickers = (tickers) => R.map(checkTickerLength, tickers);

    const returnTickerObj = (ticker) => {
        return { ticker: ticker };
    };

    const returnTickerPrice = (ticker) => {
        if (ticker.price) {
            ticker.hoverPrice = ticker.price;
        } else if (ticker.current_ask) {
            ticker.hoverPrice = ticker.current_ask;
        } else if (ticker.current_last) {
            ticker.hoverPrice = ticker.current_last;
        } else {
            ticker.noPrice = true;
        }
        return ticker;
    };

    const returnChartReady = () => chartIsReady;

    const returnDirection = (conditional) => {
        switch (conditional) {
            case '0' : return 'stagnant';
            case '-' : return 'negative';
            default  : return 'positive';
        }
    };

    const pluckTickers = (portfolio) => {
        return portfolio.tickers;
    };

    const fetchPortfolios = () => {
        return ApiFactory.getPortfolios().then((portfolios) => {
            const pluckedTickers = R.flatten(R.map(pluckTickers, portfolios));
            PORTFOLIO_TICKERS = R.map(R.prop('ticker'), pluckedTickers);

            if (portfolios) {
                if (R.not(R.isNil(portfolios[0]))) {
                    WATCHLIST = portfolios[0].tickers;
                }
            }
            return portfolios;
        });
    };

    const getPortfolios = () => {
        return Util.notEmpty(PORTFOLIOS) ? Promise.resolve(PORTFOLIOS) : fetchPortfolios();
    };

    const loadAllPortfolios = () => {
        return ApiFactory.getPortfolios().then((portfolios) => {
            const pluckedTickers = R.flatten(R.map(pluckTickers, portfolios));
            WATCHLIST = portfolios[0].tickers;
            PORTFOLIOS = portfolios;
            PORTFOLIO_TICKERS = R.map(R.prop('ticker'), pluckedTickers);
            return PORTFOLIO_TICKERS;
        });
    };

    const setPortfoliosTickers = () => PORTFOLIO_TICKERS;

    const isTickerInPortfolio = (incomingTicker, portTickers = WATCHLIST) => {
        return R.find(R.propEq('ticker', incomingTicker.ticker))(portTickers);
    };

    const searchedPortfolioCheck = (tickers) => {
        const portfolio = R.filter(isTickerInPortfolio, tickers);
        const updateTicker = R.when(R.flip(R.contains)(portfolio), R.assoc('portfolio', true));
        return R.map(updateTicker, tickers);
    };

    const portfolioAdd = (portfolio_id, ticker, skipMessage=false) => {
        ticker.data = {
            all: true,
            term_id: [],
            tags: []
        }
        
        return ApiFactory.addToPortfolio(portfolio_id, ticker).then((data) => {
            if (!skipMessage) Message.success(ticker.ticker+' added to portfolio!');
            return { portfolio_id, ticker };
        });
    };

    const portfolioRemove = (portfolio_id, ticker) => {
        return ApiFactory.deletePortfolioTickers(portfolio_id, ticker.ticker).then(() => {
            Message.success(ticker.ticker+' removed from portfolio!');
            return { portfolio_id, ticker };
        });
    };

    const returnPortfolio = () => WATCHLIST;

    const setAddTicker = (ticker) => addedTicker = ticker;

    const getAddTicker = () => addedTicker;

    const objectifyTicker = (ticker) => {
        return { ticker: ticker };
    };

    const mapObjectifyTicker = (tag) => {
        const clonedTag = R.clone(tag);
        const objectTickers = R.map(objectifyTicker, clonedTag.tickers);
        tag.loadingTickers = false;
        tag.tickers = objectTickers;
        return tag;
    };

    const emitTickerDetails = (tickerObj) => {
        if (tickerObj.percent) {
            const conditional = tickerObj.percent.toString().charAt(0);
            tickerObj.direction = returnDirection(conditional);
        }

        return tickerObj;
    };
        
    const renderTickerDetails = (tickerObj) => {
        const escapedTicker = Util.encodeTicker(tickerObj.ticker);
        return ApiFactory.getTickerDetails(escapedTicker).then((tickers) => {
            if (R.not(R.isEmpty(tickers))) {
                if (R.head(tickers).company_name) tickerObj.company = R.head(tickers).company_name;
                if (R.head(tickers).current_last) tickerObj.price   = R.head(tickers).current_last;
                if (R.head(tickers).current_changepercent) tickerObj.percent = R.head(tickers).current_changepercent;
                if (R.head(tickers).current_change_amount) tickerObj.amount  = R.head(tickers).current_change_amount;
            }
            return emitTickerDetails(tickerObj);
        }).catch((err) => !console.log('Error fetching ticker details') && err);
    };

    ////////////////////////////////////////////////////////////////////////////
    return {
        PORTFOLIO_TICKERS,
        setPortfoliosTickers,
        loadAllPortfolios,
        orderAlpha,
        noTickersMsg,
        truncateLongTickers,
        isTickerInPortfolio,
        searchedPortfolioCheck,
        portfolioAdd,
        portfolioRemove,
        returnPortfolio,
        returnTickerObj,
        returnTickerPrice,
        returnChartReady,
        returnDirection,
        getPortfolios,
        setAddTicker,
        getAddTicker,
        objectifyTicker,
        mapObjectifyTicker,
        renderTickerDetails
    };
}