/**
 * Created by paulo on 10/20/16.
 */

module.exports = angular.module('tickertags-auth')
    .service('Settings', function() {
        let self = {};

        this.create = (current) => {
            self.current = current;
            return self.current;
        };

        this.set = (type, settings) => {
            self.current[type] = settings;
            return self.current;
        };

        this.get = () => self;

        this.destroy =  () => {
            self = {};
        };

    });