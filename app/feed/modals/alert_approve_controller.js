////////////////////////////////////////////////////////////////////////////////
/**
* @name thumbsUpController
* @namespace Controller
* @desc Controls the template for the ThumbsUpModal
*/

export default function AlertApproveController(
    $state,
    AlertSubmit,
    feedItem,
    FeedFactory,
    index,
    TickersFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const isChecked = (ticker) => ticker.checked;
    const anyChecked = (tickers) => this.noneChecked = R.none(isChecked, tickers);
    const checkAll   = (ticker) => ticker.checked = true;
    const unCheckAll = (ticker) => ticker.checked = false;

    const runCheckAll = () => {
        R.chain(checkAll, this.tickers);
        this.noneChecked = false;
    };

    const runUnCheckAll = () => {
        R.chain(unCheckAll, this.tickers);
        this.noneChecked = true;
    };

    this.approveAlert = () => {
        const checkedTickers = [];
        const link = R.isEmpty(this.alertLink) ? [] : AlertSubmit.createMainArticle(this.alertLink);

        const pushChecked = (tik) => {
            if (tik.checked) { checkedTickers.push(tik.ticker); }
        };

        R.forEach(pushChecked, this.tickers);

        let approvedAlert = R.clone(this.alert);
            approvedAlert.tickers = checkedTickers;
            approvedAlert.title = this.alertTitle;
            approvedAlert.link = link;
            approvedAlert.note = this.alertNote;
            approvedAlert.timespan = $state.params.timespan;
            approvedAlert.sort = $state.params.sort;
            if (this.alertNote) approvedAlert = AlertSubmit.formatNote(approvedAlert);
            if (this.alertLink) approvedAlert = AlertSubmit.addMainLink(approvedAlert, [link]);

        return FeedFactory 
            .submit(approvedAlert, 1, index) 
            .then(() => { 
                this.$close(true); 
            }) 
            .catch((err) => !console.log(err) && true);
    };

    this.checkAllSwitch = () => this.checkAllTickers ? runCheckAll() : runUnCheckAll();

    this.tickerAlertCheck = (ticker) => ticker.checked ? this.noneChecked = false : anyChecked(this.tickers);

    this.cancel = () => this.$close();

    this.$onInit = () => {
        this.checkAllTickers = false;
        this.noneChecked = true;
        this.alertLink = '';
        this.alertNote = '';
        this.alertTitle = '';
        this.alert = feedItem;
        this.date = feedItem.date;
        this.tickers = R.map(TickersFactory.objectifyTicker, feedItem.tickers);
        this.terms = feedItem.terms;
    };
}