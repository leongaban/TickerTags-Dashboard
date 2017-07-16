////////////////////////////////////////////////////////////////////////////////
/**
 * @name Message
 * @namespace Factories
 * @desc Handles the success and failure messages
 */
import template from './message.html';
import modalController from './message_controller';

module.exports = angular
    .module('tickertags-shared')
    .factory('Message', factory);

factory.$inject = [
	'$uibModal'];

function factory(
	$uibModal) {

	const display = R.curry((msg, success, link=null) => {
		 $uibModal.open({
            template,
            controllerAs: 'm',
            bindToController: true,
            windowClass: 'dash-modal',
            resolve: {
            	msg: () => msg,
            	success: () => success,
                link: () => link
            },
            controller: modalController
        });
	});

    const success = display(R.__, true);

    const failure = display(R.__, false);

	return { display, success, failure }
}