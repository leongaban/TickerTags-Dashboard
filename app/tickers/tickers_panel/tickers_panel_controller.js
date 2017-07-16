////////////////////////////////////////////////////////////////////////////////
/**
* @name tickersPanelController
* @namespace Controller
* @desc Controls the template for the tickers panel
*/
import addTickerModal from './add_modal/add_ticker_modal.html'
import portfolioModal from '../../portfolios/manage_portfolios_modal.html'
import PortfoliosController from '../../portfolios/portfolios_controller'

export default function TickersPanelController(
    $q,
    $state,
    $uibModal,
    $rootScope,
    // container,
    ApiFactory,
    Dashboard,
    Message,
    MousePosition,
    State,
    TickersFactory,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const updatePortfolio = (ticker, action) => {
        if (action === 'add') {
            this.portfolio.tickers.push(ticker);
        } else {
            this.portfolio.tickers = R.reject(R.eqProps('ticker', ticker), this.portfolio.tickers);
        }
    }

    const displayMessage = (message, status) => {
        if (status !== 200) {
            Message.display('There was a problem, try this again later!', 'failure');
        } else {
            Message.display(message, 'success');
        }
    };

    this.onPortfolio = (ticker, action) => updatePortfolio(ticker, action);

    const setPortfolios = (result) => {
        if (result.type === 'edit') {
            this.portfolio = result.portfolio;
        }
        else if (result.type === 'create') {
            this.portfolio = result.portfolio;
            this.portfolios = [...this.portfolios, result.portfolio];
        }
        else if (result.type === 'remove') {
            this.portfolios = result.portfolios;
        }
    };

    this.removeTicker = (ticker) => {
        this.portfolio.tickers = R.reject(R.eqProps('ticker', ticker), this.portfolio.tickers);
    };

    // this.removePortfolio = (ticker) => {
    //     const encodedTicker = Util.encodeTicker(ticker.ticker);
    //     this.loadingTickersDone = false;
    //     return ApiFactory.deletePortfolio(this.portfolio.id, encodedTicker).then((data) => {
    //         TickersFactory.noTickersMsg(this.portfolio.tickers);
    //         displayMessage(`${ticker.ticker} removed from portfolio!`, data.data.status);
    //         ticker.removed = true;
    //         this.loadingTickersDone = true;
    //     });
    // };

    this.prevPortfolio = () => {
        this.current_index = this.current_index == 0 ? this.portfolios.length-1 : this.current_index-1;
        this.portfolio = this.portfolios[this.current_index];
    };

    this.nextPortfolio = () => {
        this.current_index = this.current_index < this.portfolios.length-1 ? this.current_index+1 : 0;
        this.portfolio = this.portfolios[this.current_index];
    };

    this.openManagePortfolios = (portfolios) => {
        const portfolioManagerModal = $uibModal.open({
            template: portfolioModal,
            windowClass: 'dash-modal',
            bindToController: true,
            controllerAs: 'ports',
            controller: PortfoliosController,
            resolve: {
                portfolios: function() {
                    return portfolios;
                }
            }
        })

        portfolioManagerModal.result.then((result) => setPortfolios(result));
    };

    this.openAddTickerModal = (portfolio) => {
        $uibModal.open({
            controllerAs: 'atkm',
            bindToController: true,
            template: addTickerModal,
            windowClass: 'dash-modal',
            resolve: {
                portfolio: function() {
                    return portfolio;
                }
            },
            controller: ['portfolio', function(portfolio) {
                this.portfolio = portfolio;
                this.typingTicker = (ticker) => {
                    const load = `?search=${ticker}&limit=50&start=0`;
                    return ApiFactory.getTickers(null, load).then((tickers) => {
                        this.addTickersList = tickers;
                        this.tickersListLoaded = true;
                        this.noTickers = R.isEmpty(this.addTickersList);
                    });
                };

                this.addTicker = (ticker) => {
                    TickersFactory.portfolioAdd(portfolio.id, ticker).then((res) => {
                        updatePortfolio(res.ticker, 'add');
                    });

                    this.$close({
                        portfolio
                    });
                };

                this.cancel = () => this.$close();

                this.$onInit = () => this.focusAddTicker = true;}]
        });
    };

    this.selectTicker = (ticker) => {
        State.go('.tickers.tags.activity', { ticker: ticker.ticker, portfolio: this.portfolio.id })
    };

    this.hoverTicker = (ticker, event) => {
        MousePosition.set(event);
        const mouseY = MousePosition.current.y;
        ticker.pos = { top: `${mouseY}px` };
        ticker.hoverDisplay = true;
    };

    this.leaveTicker = (ticker) => ticker.hoverDisplay = false;

    const inPortfolio = (ticker) => R.find(R.propEq('ticker', ticker), this.portfolio.tickers);

    const where = (ticker) => R.findIndex(R.propEq('ticker', ticker), this.portfolio.tickers);

    const changeSelectedTicker = (ticker) => R.not(R.equals(ticker.ticker, 'SPY')) ? R.update(where(ticker.ticker), ticker, this.tickers) : null;

    const activateSPY = () => {
        this.spy.selected = true;
        return changeSelectedTicker(this.spy);
    };

    const resolvePortfolioTicker = (ticker) => ticker.selected = true;

    const activateTicker = (ticker, tickers) => {
        const portfolioTicker = inPortfolio(ticker, tickers);
        return portfolioTicker ? resolvePortfolioTicker(portfolioTicker) : Promise.resolve();
    };

    const setActiveTicker = (ticker, tickers) => ticker === 'SPY' ? Promise.resolve(activateSPY()) : Promise.resolve(activateTicker(ticker, tickers));

    const formatTickers = (tickers) => {
        const truncated = TickersFactory.truncateLongTickers(tickers);
        return TickersFactory.orderAlpha(truncated);
    };

    const loadTickers = (portfolio_id) => {
        portfolio_id = Number(portfolio_id);
        return TickersFactory.getPortfolios().then((portfolios) => {
            const isPortfolio = portfolio_id ? R.findIndex(R.propEq('id', portfolio_id),portfolios) : 0;
            this.portfolios = portfolios;
            this.portfolio = this.portfolios[isPortfolio];
            this.portfolio.tickers = formatTickers(this.portfolio.tickers);
            this.noPortTickers = TickersFactory.noTickersMsg(this.portfolio.tickers);
            setActiveTicker(this.ticker, this.portfolio.tickers);
            State.go('.tickers.tags.activity', { ticker: $state.params.ticker, portfolio: this.portfolio.id });
            return this.portfolio.tickers;
        });
    };

    this.$onInit = () => {
        this.updatePortfolio = updatePortfolio;
        this.current_index = 0;
        this.noPortTickers = false;
        this.loadingTickersDone = false;
        this.ticker = $state.params.ticker;
        this.tickers = [];

        this.spy = {
            company_name: "All Tickers",
            longname: "SPDR S&P 500",
            ticker: "SPY",
            name: "All Tickers",
            selected: false
        };

        this.showTickersPanel = Dashboard.panelStatus($state.params.tags_open, $state.params.chart_max);

        return loadTickers($state.params.portfolio).then(() => {
            this.loadingTickersDone = true;
        });
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("tickers.import.from.manage", (event, manageTickers) => {       
        const addToDefaultPortfolio = (ticker) => {
            return TickersFactory.portfolioAdd(this.portfolio.id, ticker, true).then((res) => res);
        };

        const promises = R.map(addToDefaultPortfolio, manageTickers);

        $q.all(promises).then((res) => {
            this.portfolio.tickers = [];
            this.portfolio.tickers = TickersFactory.orderAlpha(manageTickers);
            Message.success('You have imported all your Manage tickers!');
        });
    });
}