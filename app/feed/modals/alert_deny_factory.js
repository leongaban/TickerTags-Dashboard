////////////////////////////////////////////////////////////////////////////////
/**
 * @name badAlertDenyFactory
 * @namespace Factories
 * @desc DenyAlert inits the ThumbsUp modal and Controller
 */
import template from './alert_deny.html';
import AlertDenyController from './alert_deny_controller';

module.exports = angular
    .module('tickertags-feed')
    .factory('DenyAlert', factory);

factory.$inject = [
    '$uibModal'];

function factory($uibModal) {

    const display = (tag) => {
        const modal = $uibModal.open({
            template,
            controller: AlertDenyController,
            controllerAs: 'bac',
            bindToController: true,
            windowClass: 'dash-modal',
            resolve: {
                tag: () => tag
            },
        });
    };

    return {
        display
    }
}