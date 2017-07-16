import template from './social_help.html';

export default {
    template,
    windowClass: 'dash-modal',
    controller: function() {
    	this.close = () => this.$close();
    },
    controllerAs: 'shc',
    bindToController: true
}