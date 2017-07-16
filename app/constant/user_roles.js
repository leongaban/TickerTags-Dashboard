/**
 * Created by paulo on 10/20/16.
 */
module.exports = angular.module('tickertags-auth')
    .constant('USER_ROLES', {
        All      : '*',
        Admin    : 'Admin',
        Beta     : 'Beta',
        UserFree : 'UserFree',
        UserPaid : 'UserPaid',
        Curator  : 'Curator'
    });
