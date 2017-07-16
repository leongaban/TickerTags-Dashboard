////////////////////////////////////////////////////////////////////////////////
/**
 * @name CancelSubscriptionFactory
 * @namespace Factories
 * @desc Factory for the CancelSubscriptionModal
 */

import template from './cancel_subscription.html';

export default {
    template,
    windowClass: 'dash-modal',
    bindToController: true,
    controllerAs: 'csub',
    controller: function($state, ApiFactory, Message) {
        this.$onInit = () => {};

        this.yes = () => {
            ApiFactory.deleteSubscription().then((res) => {
                console.log('ApiFactory.deleteSubscription res', res)
                Message.success('You have canceled your subscription, you can re-subscribe anytime!');
                this.$close();
                $state.go('login', {});
            });
        };

        this.cancel = () => this.$close();
    }
}