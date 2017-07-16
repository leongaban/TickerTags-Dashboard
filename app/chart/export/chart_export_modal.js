import template from './chart_export.html';
import ChartExportModalController from './chart_export_modal_controller';

export default {
    template,
    controller: ChartExportModalController,
    controllerAs: 'ex',
    bindToController: true,
    windowClass: 'dash-modal'
}