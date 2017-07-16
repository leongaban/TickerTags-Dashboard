////////////////////////////////////////////////////////////////////////////////
/**
* @name subscriptionOptions
* @namespace Component
* @desc Controls the markup for the subscriptionOptions
*/
import template from './options.html';
import update_card from './update_card';
import cancel_subscription from './cancel_subscription';

module.exports = angular
    .module('tickertags-settings')
    .component('subscriptionOptions', {
        template,
        controller: SubscriptionOptionsCtrl,
        controllerAs: 'soc',
        bindings: {
            role: '<'
        }
    });

SubscriptionOptionsCtrl.$inject = [
    '$state',
    '$uibModal',
    'ApiFactory'];

function SubscriptionOptionsCtrl(
    $state,
    $uibModal,
    ApiFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.openCancelSubscription = () => $uibModal.open(cancel_subscription);

    this.renewSubscription = () => {
        // ApiFactory.subscriptionRenew().then(r => !console.log('Subscription Renewed') && true).catch(console.error)
        ApiFactory.subscriptionRenew().then((res) => {
            console.log('ApiFactory.subscriptionRenew', res);
        }).catch(console.error)
    };

    this.openUpdateCard = () => $uibModal.open(update_card);

    this.$onInit = () => {
        this.hideRenew = false;
        this.renew = $state.current.name === 'renew';
        // console.log('subscriptionOptions role', this.role)

        if (this.role === "Pending") {
            this.hideRenew = true;
        }
    };
}