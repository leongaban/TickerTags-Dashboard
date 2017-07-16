import template from './view_save_load_modal.html'
import ViewSaveLoadController from './view_save_load_controller'

module.exports = angular
    .module('tickertags-view-header')
    .component('viewSaveLoad', {
        template,
        controller: ViewSaveLoadController,
        bindings: {
            close: '&',
            dismiss: '&',
            resolve: '<'
        }
    });