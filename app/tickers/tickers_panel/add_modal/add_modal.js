import template from './add_ticker_modal.html';
import addModalController from './add_modal_controller';

export default {
    template,
    bindToController: true,
    controller: addModalController,
    controllerAs: 'atkm',
    windowClass: 'dash-modal'
}