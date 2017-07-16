module.exports = angular
    .module('tickertags-auth')
    .factory('AuthResolver', factory);

factory.$inject = [
    '$q',
    '$rootScope',
    '$location',
    'AuthFactory'];

function factory(
    $q,
    $rootScope,
    $location,
    AuthFactory) {

    return {
        resolve: () => {
            const deferred = $q.defer();
            const unwatch = $rootScope.$watch('currentUser', (currentUser) => {
                if (angular.isDefined(currentUser)) {
                    if (currentUser) {
                        deferred.resolve(currentUser);
                    } else {
                        AuthFactory.check_login().then((user) => {
                            $rootScope.currentUser = user;
                            deferred.resolve(user);
                        }, () => {
                            deferred.reject();
                            $location.url('/login');
                        });
                    }
                    unwatch();
                }
            });
            return deferred.promise;
        }
    };
};