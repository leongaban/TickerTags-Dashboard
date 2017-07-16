////////////////////////////////////////////////////////////////////////////////
/**
* @name stateGo
* @namespace Factory
* @desc Module for the StateGo Factory
*/

module.exports = angular.module('tickertags-shared').factory('State', factory);

factory.$inject = ['$state'];
function factory($state) {
    ////////////////////////////////////////////////////////////////////////////
    const base = 'container.dashboard';
    const go = (path, params, reload = false) => {
        return $state.go(`${base}${path}`, params, { reload }).then((res) => {
            return res;
        });
    };

    return { go }
}