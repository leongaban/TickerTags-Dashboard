module.exports = angular.module('tickertags-shared').
    filter('capitalize', () => {
    return (input, all) => {
        const reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : '';
    }
});