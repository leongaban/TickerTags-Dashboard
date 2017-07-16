/**
 * Created by paulo on 2/8/17.
 */

module.exports = angular
    .module('tickertags-feed')
    .filter('adminFeed', function () {
        return (feed, isAdmin) => {
            const pending = isAdmin ? 0 : 1;
            return feed.filter(alert => alert.approved === pending);
        }
    });