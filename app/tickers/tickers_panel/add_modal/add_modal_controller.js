export default function (ApiFactory) {
    this.typingTicker = (ticker) => {
        const load = "?search=" + ticker + "&limit=50&start=0";
        return ApiFactory.getTickers(null, load).then((tickers) => {
            this.addTickersList = tickers;
            this.tickersListLoaded = true;
            this.noTickers = R.isEmpty(this.addTickersList);
        });
    };

    this.addTicker = (ticker) => {
        this.$close(ticker);
    };

    this.cancel = () => this.$close();

    this.$onInit = () => this.focusAddTicker = true;
}