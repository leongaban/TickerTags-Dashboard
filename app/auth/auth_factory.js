////////////////////////////////////////////////////////////////////////////////
/**
 * @name AuthFactory
 * @namespace Factory
 * @desc Handles user Authentication
 */

module.exports = angular
    .module('tickertags-auth')
    .factory('AuthFactory', factory);

factory.$inject = [
    '$http',
    'api',
    'ApiFactory',
    'Session',
    'Settings',
    'UserFactory'];

function factory(
    $http,
    api,
    ApiFactory,
    Session,
    Settings,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    
    const login = (credentials) => {
        return $http.post(api.login, credentials).then((res) => {
            Session.destroy();
            Session.create(
                res.data.session_id,
                res.data.user.username,
                res.data.user.role);
            return res.data;
        }).catch(apiError);
    };

    const loginCheck = (credentials) => $http.post(api.login, credentials).then((res) => res.data.user).catch(apiError);

    const logout = () => {
        Settings.destroy();
        Session.destroy();
    };

    const check_login = () => {
        const session = Session.get();
        return Session.check(session) ?
            $http.get(api.login, { cache: false }).then((res) => {
            return Session.create(
                res.data.session_id,
                res.data.user.username,
                res.data.user.role);
            }).catch(apiError) : Promise.resolve(session);
    };

    const reset_password = (password) => {
        return $http.put(api.passwordChange, { password: password }).then((res) => res).catch(apiError);
    };

    const isCurator = () => !!Session.userRole;
 
    const isAuthorized = (authorizedRoles) => {
        if (!angular.isArray(authorizedRoles)) authorizedRoles = [authorizedRoles];
        return (isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    const isAuthenticated = () => !!Session.userId;
    
    const webservice_logout = () => {
        UserFactory.clearUser();
        Session.destroy();
        Settings.destroy();
        return $http.delete(api.login);
    };

    return {
        login,
        loginCheck,
        logout,
        check_login,
        reset_password,
        isCurator,
        isAuthorized,
        isAuthenticated,
        webservice_logout
    };
}