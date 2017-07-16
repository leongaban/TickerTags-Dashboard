////////////////////////////////////////////////////////////////////////////////
/**
 * @name LoginController
 * @namespace Controller
 * @desc Controls the user login page
 */

import querystring from 'query-string'

export default function LoginCtrl(
    $state,
    $rootScope,
    AUTH_EVENTS,
    AuthFactory,
    Dashboard,
    Message,
    Util,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const { notEmpty } = Util;
    const redirect = $state.current.data.redirect;
    this.credentials = { username : '', password : '' };

    this.login = (credentials) => {
        UserFactory.clearUser();
        return AuthFactory.login(credentials).then((data) => {
            if (data.status === "success") {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                if (data.password_reset) {
                    $state.go('password', {});
                }
                else {
                    // If user has changed his password:
                    if (data.user.password_reset === 1) {
                        UserFactory.setUserPasswordreset(true);
                    }

                    const queryConverted = Util.queryStringBooleans(querystring.parse(redirect));
                    // console.log('login redirect', redirect);
                    notEmpty(redirect)
                        ? $state.go('container.dashboard.tickers.tags.activity', queryConverted)
                        : $state.go('container.dashboard.tickers', {});
                }
            }
            else if (data.status === 400) {
                // console.log('400', data);
                Message.failure('Please renew your subscription.');
                $state.go('renew', {});
            }
            else {
                Message.failure('Incorrect credentials, check your username or password.');
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $state.go('login', {});
            }
            
        }).catch((error) => {
            console.log('catch error');
            $state.go('login', {});
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    };

    this.gotoPasswordReset = () => {
        $state.go('passwordreset', {});
    };

    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, () => {
        AuthFactory.logout();
        $state.go('login', {});
    });
}
