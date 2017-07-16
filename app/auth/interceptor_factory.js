module.exports = angular
    .module('tickertags-auth')
    .factory('AuthInterceptor', factory);

factory.$inject = ['$injector', '$rootScope', '$q', 'AUTH_EVENTS'];
function factory($injector, $rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: (response) => {
            $rootScope.$broadcast({
                '401': AUTH_EVENTS.notAuthenticated,
                '403': AUTH_EVENTS.notAuthorized,
                '419': AUTH_EVENTS.sessionTimeout,
                '440': AUTH_EVENTS.sessionTimeout
            }[response.status], response);

            // console.log('AuthInterceptor response', response);

            if (response.status == 401) {
                // http://stackoverflow.com/questions/20230691/injecting-state-ui-router-into-http-interceptor-causes-circular-dependency
                $injector.get('$state').transitionTo('login');
            }

            return $q.reject(response);
        }
    };
};