export default function(
    ticker,
    ApiFactory,
    TickersFactory) {

    // Functions ///////////////////////////////////////////////////////////////
    this.$onInit = () => {
        console.log('Analytics ticker', ticker);
        this.ticker = ticker;

        ApiFactory.getReports(ticker).then((res) => {
            this.reports = res.data.reports.map(R.prop('data'));
            console.log(this.reports);
        });

        TickersFactory
            .renderTickerDetails({ ticker })
            .then((ticker) => {
                this.companyName = ticker.company;
                this.price   = ticker.price   ? ticker.price   : this.hidePrice   = true;
                this.percent = ticker.percent ? ticker.percent : this.hidePercent = true;
                this.amount  = ticker.amount;
            });
    };
}