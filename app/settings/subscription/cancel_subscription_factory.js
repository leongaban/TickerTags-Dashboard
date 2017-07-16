////////////////////////////////////////////////////////////////////////////////
/**
 * @name CancelSubscriptionFactory
 * @namespace Factories
 * @desc Factory for the CancelSubscriptionModal
 */

import template from './cancel_subscription.html';

module.exports = angular
    .module('tickertags-settings')
    .factory('CancelSubscriptionFactory', factory);

factory.$inject = [
    '$state',
	'$uibModal',
    'ApiFactory',
    'Message'];

function factory(
    $state,
	$uibModal,
    ApiFactory,
    Message) {

	const display = () => {
		$uibModal.open({
            template,
            windowClass: 'dash-modal',
            bindToController: true,
            controllerAs: 'csub',
            controller: function() {
                this.$onInit = () => {};

                this.yes = () => {
                    ApiFactory.deleteSubscription().then((res) => {
                        console.log('res', res)
                        Message.success('You have canceled your subscription, you can re-subscribe anytime!');
                        this.$close();
                        $state.go('login', {});
                    });
                };

                this.cancel = () => this.$close();
            }
        });
	};

	return {
		display
	}
}