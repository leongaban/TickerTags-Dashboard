export default function TimeHeaderCtrl(
    $scope,
    $state,
    ApiFactory,
    EPOCH,
    Format,
    Message,
    SocialMediaFactory,
    State,
    TagsContainer,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const updateActiveTimespan = (string) => {
        const timespan = {};
        switch(string) {
            case 'minute' :
            case 'hour'   : timespan.h1  = true; break;
            case 'day'    : timespan.d1  = true; break;
            case 'week'   : timespan.w1  = true; break;
            case 'month'  : timespan.mo1 = true; break;
            case '3month' : timespan.mo3 = true; break;
            case 'year'   : timespan.yr1 = true; break;
            case '2year'  : timespan.yr2 = true; break;
            case 'max'    : timespan.max = true; break;
        }

        return timespan;
    };

    this.changeTime = (duration, interval, group=null) => {
        const ticker = $state.params.ticker;
        const socialContent = $state.params.stream;
        const isTweet = socialContent === 'tweets' ? EPOCH.earliest.tweets : EPOCH.earliest.social;
        const isMax = (interval) => interval === 'max';
        const end_epoch = moment().unix();
        const start_epoch = isMax(interval) ? isTweet : moment.unix(end_epoch).subtract(duration, interval).unix();
        const timespan = Format.timespan(duration, interval);
        updateActiveTimespan(interval);
        // console.log(moment.unix(end_epoch).format('MM/DD hh:mm'));
        // console.log(moment.unix(start_epoch).format('MM/DD hh:mm'));
        State.go('.tickers.tags.activity', { ticker, start_epoch, end_epoch, timespan, group });
    };

    // jQuery UI Date range picker /////////////////////////////////////////////
    const setDateObjects = (type, date) => {
        // http://ramdajs.com/0.21.0/docs/#lens
        const lens = R.lens(R.prop(type), R.assoc(type));
        const cal = { start: '', end: '' };
        cal[type] = date.split('/');
        cal[type].month = cal[type][0];
        cal[type].day   = cal[type][1];
        cal[type].year  = cal[type][2];
        if (cal[type].year.length < 4) cal[type].year = `20${cal[type].year}`;
        return R.over(lens, R.omit(['0', '1', '2']), cal);
    };

    const fixDate = (type, date) => date === '' ? false : setDateObjects(type, date);

    const setDateStrings = (type, date) => {
        const momentDate   = `${date[type].year}-${date[type].month}-${date[type].day}`;
        this.display[type] = `${date[type].month}/${date[type].day}/${date[type].year}`;
        return moment(momentDate).unix();
    };

    const createEpoch = (type, value) => {
        const date = fixDate(type, value);
        return date ? setDateStrings(type, date) : false;
    };

    const initDatePickers = () => {
        $(() => $('#startdatepicker').datepicker());
        $(() => $('#enddatepicker').datepicker());
    };

    this.setChartRange = () => {
        const ticker = $state.params.ticker;
        const start_epoch = createEpoch('start', document.getElementById('startdatepicker').value);
        const end_epoch   = createEpoch('end', document.getElementById('enddatepicker').value);

        if (start_epoch && end_epoch) {
            State.go('.tickers.tags.activity', { ticker, start_epoch, end_epoch });
        } else {
            Message.failure('Please select both dates');
        }
    };
    ////////////////////////////////////////////////////////////////////////////

    const totalUnder3 = (total) => total < 3;

    const displayAlert = (message) => Message.failure(message);

    const prepSaveTag = (ticker_tag, tag, ticker) => {
        tag.favorite = ticker_tag.favorite;
        tag.tickers  = ticker_tag.tickers;
        const saveTag = (tag) => TagsContainer.processTag(tag);
        return saveTag(tag);
    };

    const selectTag = (tag, ticker = null) => {
        const currentTags = TagsContainer.getTags();
        return totalUnder3(currentTags.length)
            ? ApiFactory.getTagDataSlim(tag.term_id).then((ticker_tag) => prepSaveTag(ticker_tag, tag, ticker))
            : displayAlert('Only 3 tags can be monitored at a time.');
    };

    this.setTicker = (ticker) => State.go('.tickers.tags.activity', { ticker: ticker.ticker });

    this.onPortfolio = (ticker, action) => this.onPortfolioUpdate({ ticker, action });

    this.setTag = (tag) => {
        tag.mainSearch = true;
        tag.hoverDisplay = false;
        selectTag(tag);
    };

    ////////////////////////////////////////////////////////////////////////////
    this.$onInit = () => {
        this.display  = { start: null, end: null };
        this.interval = updateActiveTimespan($state.params.timespan);
        this.hide = $state.params.analytics;
        this.feedOpen = R.equals(true, $state.params.feed_open);
        initDatePickers();
    };
}