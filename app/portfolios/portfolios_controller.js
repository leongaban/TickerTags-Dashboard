////////////////////////////////////////////////////////////////////////////////
/**
 * @name PortfoliosController
 * @namespace Controller
 * @desc Controls the manage Portfolios modal
 */

import createPortfolioModal from './create-portfolio-modal.html'
import PortfolioCreateEditController from './portfolio_create_edit_controller'

export default function PortfoliosController(
    portfolios,
    $scope,
    $uibModal,
    ApiFactory,
    Message) {

    ////////////////////////////////////////////////////////////////////////////
    this.createEditPortfolio = (type, portfolio) => {
        if (!portfolio) {
            portfolio = {
                data: {
                    fields: 'incidence',
                    source: 'twitter'
                },
                email_address: '',
                email_notification: 0,
                frequency: 'daily',
                name: '',
                tickers: []
            }
        }
        const createEditPortfolio = $uibModal.open({
            template: createPortfolioModal,
            windowClass: 'dash-modal',
            bindToController: true,
            controllerAs: 'cpm',
            controller: PortfolioCreateEditController,
            resolve: {
            	type: function() {
            		return type;
            	},
            	portfolio: function() {
            		return portfolio;
            	}
            }
        });

        createEditPortfolio.result.then((result) => this.$close(result));
    };

    this.cancel = () => this.$dismiss();

    this.removePortfolio = (portfolio) => {
    	return ApiFactory.deletePortfolio(portfolio.id).then((res) => {
            this.portfolios = R.reject(R.eqProps('id', portfolio), this.portfolios);

    		this.$close({
                type: 'remove',
    			portfolios: this.portfolios
    		});

    		Message.success(`${portfolio.name} removed!`);
    	});
    };

    this.$onInit = () => this.portfolios = portfolios;
}