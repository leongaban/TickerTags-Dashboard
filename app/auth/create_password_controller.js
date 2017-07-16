////////////////////////////////////////////////////////////////////////////////
/**
 * @name createPasswordController
 * @namespace Controller
 * @desc Allows the user to create their password
 */

module.exports = angular
    .module('tickertags-auth')
    .controller('CreatePassCtrl', PassResetCtrl);

PassResetCtrl.$inject = [
    '$timeout',
    'ApiFactory'];

function PassResetCtrl(
    $timeout,
    ApiFactory) {

    /////////////////////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;

    this.credentials = {
        password1 : '',
        password2 : ''
    };

    this.submitPassword = (credentials) => {
        const errorCheck = [];
        this.processing  = true;
        
        // Error messages:
        if (credentials.password1 === "") {
            this.message = "Please enter a password.";
            $timeout(() => { this.message = ''; }, 4000);
        } else if (credentials.password1.length < 4) {
            this.message = "Your password is too short.";
            $timeout(() => { this.message = ''; }, 4000);
        } else {
            errorCheck.push('1');
        }

        if (/\s/.test(credentials.password1)) {
            this.message = "You have space in your password.";
            $timeout(() => { this.message = ''; }, 4000);
        } else {
            errorCheck.push('2');
        }

        if (credentials.password1 != credentials.password2) {
            this.message = "Your passwords do not match.";
            $timeout(() => { this.message = ''; }, 4000);
        } else {
            errorCheck.push('3');
        }

        if (errorCheck.length === 3) {
            ApiFactory.userPasswordChange({ password: credentials.password1 }).then((status) => {
                if (status == 'Success') {
                    this.messageSuccess = 'Password created! Going to Dashboard...';
                    $timeout(() => { this.processing = false; }, 500);
                    $timeout(() => { this.messageSuccess = ''; $location.path('/dashboard'); }, 1000);
                }
                else {
                    this.message = 'There was an error, please try again.';
                    $timeout(() => { this.processing = false; }, 2000);
                    $timeout(() => { this.message = ''; }, 4000);
                }
            }).catch(apiError);
        }
    };
}