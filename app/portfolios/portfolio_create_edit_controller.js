export default function PortfolioCreateEditController(
    portfolio,
    type,
    ApiFactory,
    Format,
    Message,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.selectedTags = [];
    const FREQUENCY = ['daily', 'weekly', 'monthly'];

    const ticker_data_model = {
        all: true,
        term_id: [],
        tags: []
    };

    this.updateTicker = (index, ticker) => {
        if (!this.create) {
            portfolio.tickers[index] = ticker;
        }
    };

    // Selected Ticker from search is added to the Portfolio Tickers Array:
    this.setTicker = (ticker) => {
        ticker.data = ticker_data_model;
        ticker.selectedTags = [];
        ticker.selectedCategories = [];
        const sortedTickers = [ticker, ...this.portfolio.tickers];
        sortedTickers.forEach((ticker, index) => ticker.sort_order = index+1);
        this.portfolio.tickers = sortedTickers;
    };

    this.removeTicker = (ticker) => {
        return ApiFactory.deletePortfolioTickers(portfolio.id, ticker.ticker).then((res) => {
            this.portfolio.tickers = R.reject(R.eqProps('ticker', ticker), this.portfolio.tickers);
            this.$close(this.portfolio.tickers);
            Message.success(`${ticker.ticker} removed!`);
        });
    };

    const addTermsAndCategories = (ticker) => {
        ticker.data.term_id = R.map(R.prop('term_id'), ticker.selectedTags);
        ticker.data.tags = ticker.selectedCategories;
        return ticker;
    };

    const tickerEssentials = R.pick(['data', 'ticker', 'sort_order']);

    this.save = () => {
        return ApiFactory.updatePortfolio(this.portfolio).then(() => {
            const portfolioTickers = this.portfolio.tickers.map(tickerEssentials);
            return ApiFactory.putPortfolioTickers(this.portfolio.id, portfolioTickers).then((res) => {
                const portfolio = this.portfolio;
                this.$close({
                    type,
                    portfolio
                });
                Message.success(`${this.portfolio.name} updated!`);
            });
        });
    };
    this.portfolioSample = (portfolio_id) => ApiFactory.portfolioReport(portfolio_id);

    this.createPortfolio = () => {
        const portfolio_name = this.portfolio.name;
        const portfolio_tickers = this.portfolio.tickers.map(addTermsAndCategories).map(tickerEssentials);
        return ApiFactory.createPortfolio(portfolio_name, portfolio_tickers, this.portfolio.frequency, this.portfolio.email_notification).then((res) => {
            Message.success(`${portfolio_name} created!`);
            const portfolio = res.data;
            this.$close({
                type,
                portfolio
            });
        });
    };

    this.cancel = () => this.$dismiss();

    this.$onInit = () => {
        this.create = type === 'create';
        this.title = `${Format.capFirstLetter(type)} Portfolio`;
        this.portfolio = portfolio;
        this.frequencies = FREQUENCY;
        this.portfolio.frequency = FREQUENCY[1];

        if (R.not(this.create)) {
            const user_role = UserFactory.getUserObject().user.userRole;
            this.sample = user_role === 'Admin' || user_role === 'Beta';
        }
    };
}