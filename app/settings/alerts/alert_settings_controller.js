export default function AlertSettingsController(
    $state,
    $rootScope,
    Dashboard,
    FeedSettingsFactory,
    Message,
    Session,
    Settings,
    State,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    let PREVIOUS_STATE = {};
    
    const wireView = (settings) => {
        this.enabled        = settings.enabled;
        this.all_tickers    = settings.all_tickers;
        this.alertScope     = this.all_tickers ? 'all' : 'portfolio';
        this.tag_insight    = settings.tag_insight;
        this.tag_breaking   = settings.tag_breaking;
        this.tag_momentum   = settings.tag_momentum;
        this.event_breaking = settings.event_breaking;
        this.cash_breaking  = settings.cash_breaking;
        this.cash_momentum  = settings.cash_momentum;
        this.tag_sentiment  = settings.tag_sentiment;
        this.cash_sentiment = settings.cash_sentiment;
        this.emailSummary   = this.email_summary  = settings.email_summary;
        this.emailRealtime  = this.email_realtime = settings.email_realtime;
        this.checkSMS       = settings.sms_notification;
        this.smsNumber      = settings.sms_number;
        return settings;
    };

    this.setFilter = (type) => {
        this.settingsModel[type] = this[type];
        this.settingsModel = FeedSettingsFactory.set(R.clone(this.settingsModel));
    };

    this.setAlertScopeAll = (bool) => FeedSettingsFactory.setScope(bool);

    this.setEmailSummary  = () => FeedSettingsFactory.setEmail('email_summary', this.emailSummary);

    this.setEmailRealtime = () => FeedSettingsFactory.setEmail('email_realtime', this.emailRealtime);

    this.setSMS = () => {
        if (!this.checkSMS) this.smsNumber = null;
        FeedSettingsFactory.setSMS(this.checkSMS);
    };

    const smsNumberCheckGood = () => !(this.checkSMS && !this.smsNumber);

    const saveSettings = () => {
        FeedSettingsFactory.setSMSnumber(this.smsNumber);
        return FeedSettingsFactory.save().then((res) => {
            return UserFactory.settings().then(() => {
                Message.display('Alert Settings Saved!', true);
                PREVIOUS_STATE = Dashboard.getPreviousState();
                State.go('.tickers.tags.activity', PREVIOUS_STATE);
            });
        });
    };

    const displaySMSnumberError = () => Message.display('You selected SMS notifications, please enter a number.', false);

    this.submitFeedSettings = () => smsNumberCheckGood() ? saveSettings() : displaySMSnumberError();

    this.$onInit = () => {
        this.emailRealtime = true;
        this.emailSummary = false;
        this.checkSMS = false;

        PREVIOUS_STATE = Dashboard.getPreviousState();

        UserFactory.retrieve().then((settings) => {
            this.settings = settings;
            this.isAdmin = Session.get().isAdmin;
            this.settingsModel = wireView(this.settings.alert_settings);
        });
    };

    this.backToDash = () => {
        State.go('.tickers.tags.activity', PREVIOUS_STATE);
    };
}