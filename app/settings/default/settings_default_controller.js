export default function SettingsDefaultCtrl(
    $state,
    ApiFactory,
    AuthFactory,
    Dashboard,
    Message,
    State,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const passwordMatchCheck = () => this.password.new1 === this.password.new2;

    const checkBlackErrors = () => R.any(R.isEmpty)([this.password.current, this.password.new1, this.password.new2]);

    const displayError = (type) => {
        this.hasError = true;
        switch(type) {
            case 'blank': this.errorMsg = `You can't leave any fields blank.`;   break;
            case 'match': this.errorMsg = `Your new password does not match.`;   break;
            case 'wrong': this.errorMsg = `Your current password is incorrect.`; break;
        }
    };

    const postNewPassword = (newPassword) => {
        return AuthFactory.reset_password(newPassword).then(() => {
            Message.success('You have changed your password!');
            this.password.current = this.password.new1 = this.password.new2 = '';
        });
    };

    const updatePassword = () => {
        const userObj = UserFactory.getUserObject();

        const credentials = {
            username: userObj.user.username,
            password: this.password.current
        };

        return ApiFactory.checkPassword(credentials).then((passwordCorrect) => {
            return passwordCorrect ? postNewPassword(this.password.new1) : displayError('wrong');
        });
    };

    this.updateSettings = () => {
        this.hasError = false;
        checkBlackErrors() ? displayError('blank') : passwordMatchCheck() ? updatePassword() : displayError('match');
    };

    this.backToDash = () => {
        let previous_state = Dashboard.getPreviousState();
        State.go('.tickers.tags.activity', previous_state);
    };

    this.closeErrorMsg = () => this.hasError = false;

    this.resetPassword = () => { window.open('https://www.tickertags.com/dashboard/#!/passwordreset', '_blank'); };

    this.$onInit = () => {
        this.hasError = false;
        this.password = { current: '', new1: '', new2: '' };
        this.default = $state.current.name === 'settings.default';
        // console.log('SettingsDefaultCtrl', $state.params);
    };
}