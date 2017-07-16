////////////////////////////////////////////////////////////////////////////////
/**
* @name mousePositionFactory
* @namespace Factory
* @desc Tracks the current mouse position for use in ticker and tag hovers
*/

module.exports = angular
    .module('tickertags-shared')
    .factory('MousePosition', factory);

factory.$inject = [];

function factory() {
    const current = {};

    const set = (e) => {
        current.x = e.pageX;
        current.y = e.pageY;
    };

    return {
        current,
        set
    }
}