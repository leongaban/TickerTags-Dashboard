import userDropdownTemplate from './user_drop_down.html';
import UserDropDownController from './user_drop_down_controller';

export default function PlatformCtrl(
    api,
    $cookies,
    $element,
    $rootScope,
    $state,
    $uibModal,
    ApiFactory,
    AlertSubmit,
    FeedFactory,
    Message,
    Session,
    State,
    TagsContainer) {

    ////////////////////////////////////////////////////////////////////////////
    const isAdmin = (session) => session.userRole === 'Admin';

    const setUsername = (username) => this.username = username;

    this.openSubmitAlert = () => AlertSubmit.display($state.params.ticker, this.container);

    this.resetDashboard = () => {
        const ticker = 'SPY';
        TagsContainer.clearContainer();

        $state.go('container.dashboard.tickers', {
            ticker,
        }).then(() => {
            $state.go('container.dashboard.tickers.tags', { ticker }, { reload: true });
        });
    };

    this.toggleFeedPanel = () => {
        this.feedOpen = !this.feedOpen;
        State.go('.tickers.tags.activity', { feed_open: this.feedOpen });
    };

    // Do not removed, needed for Analytics release
    this.switchView = (view) => {
        switch(view) {
            case 'analytics':
                $state.go('container.analytics', { ticker: this.ticker });
                break;
            case 'dashboard':
                const params = $cookies.getObject('tickertags');
                State.go('.tickers.tags.activity', params);
                break;
        }
    };

    this.gotoHelp = () => { window.open('https://www.tickertags.com/help.html', '_blank'); };

    this.toggleUserDropdown = () => {
        $uibModal.open({
            appendTo: $element,
            controller: UserDropDownController,
            controllerAs: 'udd',
            template: userDropdownTemplate,
            windowClass:'user-settings-menu',
            bindToController: true
        });
    };

    this.$onInit = () => {
        this.showInsightForm = false;
        this.newAlerts = false;
        this.username = '';
        this.onAnalytics = $state.current.name === 'container.analytics';
        this.ticker = $state.params.ticker;

        this.alert = {
            type: 'insight',
            title: '',
            note: '',
            tickers: [],
            terms: [],
            link: null,
            mainLink: null
        };

        const session = Session.get();
        this.feedOpen = R.equals(true, $state.params.feed_open);
        this.submitAlert = isAdmin(session);
        setUsername(session.username);
    };

    this.fakeAlert = () => {
        if (api.websocket.startsWith('wss') && api.termtrend.startsWith('http')) {
            throw new Error(`Do not alerts in production if you are running local, current: ${api.name}`);
        }
        FeedFactory.web_conn().url.includes('localhost') ?
            FeedFactory.web_conn().send({
                "approved"       : 1,
                "type"           : 'spike',
                "tickers"        : [this.ticker],
                "start_epoch"    : this.startEpoch,
                "term_id_1"      : 12345,
                "term_trend_id"  : 123456,
                "terms"          : ['fake'],
                "note"           : 'test',
                "end_epoch"      : this.endEpoch,
                "percent_change" : 100
            })
            : Message.failure('Change to local environment');
    };

    this.importManageTickers = () => {
        ApiFactory.importManageTickers().then((manageTickers) => {
            $rootScope.$emit("tickers.import.from.manage", manageTickers);
        });
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on("platformHeader.new.alert", () => this.newAlerts = true); // From FeedFactory
}