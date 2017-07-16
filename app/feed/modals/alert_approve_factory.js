////////////////////////////////////////////////////////////////////////////////
/**
 * @name thumbsUpFactory
 * @namespace Factories
 * @desc AlertApprove inits the ThumbsUp modal and Controller
 */
import template from './alert_approve.html'
import AlertApproveController from './alert_approve_controller'

module.exports = angular
    .module('tickertags-feed')
    .factory('AlertApprove', factory);

factory.$inject = [
	'$uibModal'];

function factory(
	$uibModal) {

	const display = (feedItem, index) => {
		return $uibModal.open({
            controller: AlertApproveController,
            controllerAs: 'thu',
            bindToController: true,
            template,
            windowClass: 'dash-modal',
            resolve: {
                feedItem: () => feedItem,
                index: () => index
            },
        }).result
            .then(approved => approved)
	};

    const fillTags = (alert) => {
        const tempArray = [];
        if (alert.term_name_1) tempArray.push(alert.term_name_1);
        if (alert.term_name_2) tempArray.push(alert.term_name_2);
        if (alert.term_name_3) tempArray.push(alert.term_name_3);
        return tempArray;
    };

	return {
		display,
        fillTags
	}
}