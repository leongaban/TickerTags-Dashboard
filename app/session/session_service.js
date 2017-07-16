/**
 * Created by paulo on 10/20/16.
 */

module.exports = angular.module('tickertags-auth')
    .service('Session', function() {
        let self = {};

        this.check = R.either(R.isNil, R.isEmpty);

        this.create = (sessionId, userId, userRole) => {
            self.id       = sessionId;
            self.username   = userId;
            self.userRole = userRole;
            self.isAdmin  = R.equals('Admin', userRole);
            return self;
        };

        this.get = () => self;

        this.destroy =  () => {
            self = {};
        };
    });