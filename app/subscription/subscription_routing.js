import customer_template from './customer/customer.html';
import payment_template from './payment/subscription_payment.html';
import CustomerDetailsController from './customer/customer_details_controller';

export const subscription = {
    name: 'subscription',
    url:'/subscription',
    template: `<div ui-view=""></div>`
};

export const payment = {
    name: 'subscription.payment',
    url: '/payment',
    template: payment_template,
    resolve: {
        user: (AuthFactory) => AuthFactory.check_login()
    }
};

export const customer = {
    name: 'subscription.customer',
    url: '/customer',
    template: customer_template,
    controller: CustomerDetailsController,
    controllerAs: 'cust'
};
