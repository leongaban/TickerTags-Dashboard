////////////////////////////////////////////////////////////////////////////////
/**
* @name subscriptionOptions
* @namespace Component
* @desc Controls the markup for the subscriptionOptions
*/
import template from './stripe_card_payment.html';
import StripeCardCtrl from './stripe_card_payment_controller';

module.exports = angular
    .module('tickertags-subscription')
    .component('stripeCardPayment', {
        template,
        controller: StripeCardCtrl,
        controllerAs: 'scp',
        bindings: {
        	onPayment: '&'
        }
    });