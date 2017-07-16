import template from './help_modal.html';

export default {
    controllerAs: 'tkhelp',
    bindToController: true,
    template,
    windowClass: 'dash-modal',
    controller: function () {
        this.cancel = () => this.$close();
    }
}