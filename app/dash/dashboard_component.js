////////////////////////////////////////////////////////////////////////////////
/**
 * @name dashboard
 * @namespace Component
 * @desc The main Dashboard component
 */
import template from './dashboard.html'

module.exports = angular
    .module('tickertags-dash')
    .component('dashboardComponent', {
        template,
        controller: DashCtrl,
        controllerAs: 'dash',
        bindings: {
        	portfolio_tickers: '<'
        }
    });

DashCtrl.$inject = [
	'portfolio_tickers'
];

function DashCtrl(portfolio_tickers) {
	console.log('DashCtrl portfolio_tickers', portfolio_tickers);
    // console.log('DashCtrl');
}
