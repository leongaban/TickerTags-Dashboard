export default function AppRun(
    $rootScope,
    $cookies,
    $httpParamSerializer,
    $location,
    $state,
    AUTH_EVENTS,
    AuthFactory,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const { notEmpty } = Util;
    const redirectLogin = () => {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        $location.url('/login');
    };

    const userNotAllowed = () => {
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        $location.url('/login');
    };

    const userNotLoggedIn = () => {
        $rootScope.ifLoggedOut = true;
        AuthFactory.check_login().then((user) => {
            $rootScope.ifLoggedOut = false;
            $rootScope.currentUser = user;
            $rootScope.username = user.username;
            if (user.role === 'Curator') $rootScope.isCurator = true;
        }).catch(redirectLogin);
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        // console.log('to', to);
        if (notEmpty(from.name) && to.name != 'container.analytics') $cookies.putObject('tickertags', $state.params);
    });

    $rootScope.$on('$routeChangeStart', (event, next) => {
        const authorizedRoles = next.data.authorizedRoles;
        if (!AuthFactory.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            AuthFactory.isAuthenticated() ? userNotAllowed() : userNotLoggedIn();
        }
    });
}