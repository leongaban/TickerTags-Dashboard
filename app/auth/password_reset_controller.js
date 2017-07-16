////////////////////////////////////////////////////////////////////////////////
/**
 * @name passResetController
 * @namespace Controller
 * @desc Controls the form for users to reset their password (gain access)
 */

module.exports = angular
    .module('tickertags-auth')
    .controller('PassResetCtrl', PassResetCtrl);

PassResetCtrl.$inject = [
    '$timeout',
    'ApiFactory'];

function PassResetCtrl(
    $timeout,
    ApiFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.credentials = {
        password1 : '',
        password2 : ''
    };

    this.resetMe = (credentials) => {
        this.hideMessage = true;
        this.processing = true;

        if (credentials === undefined) {
            this.message = 'Please use a valid email address.';
            this.success = false;
            this.hideMessage = false;
            this.processing = false;
        }
        else {
            ApiFactory.userPasswordReset(credentials.email).then((status) => {
                if (status == 'Success') {
                    this.message = 'Reset email has been sent, once you receive it, use the temporary password to login.';
                    this.success = true;
                    this.hideMessage = false;
                    $timeout(() => { this.processing = false; }, 2000);
                }
                else {
                    this.message = 'Invalid email address - please use the email address from your invite.';
                    this.hideMessage = false;
                    $timeout(() => { this.processing = false; }, 2000);
                }
            });
        }
    }
}