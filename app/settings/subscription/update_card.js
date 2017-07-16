////////////////////////////////////////////////////////////////////////////////
/**
 * @name UpdateCardFactory
 * @namespace Factories
 * @desc Factory for the UpdateCardModal
 */

import template from './update_card.html';

export default {
    template,
    windowClass: 'dash-modal',
    bindToController: true,
    controllerAs: 'upay',
    controller: function() {
        this.$onInit = () => {};
        this.cancel = () => this.$close();
    }
}