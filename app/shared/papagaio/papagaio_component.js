import template from './papagaio.html'

module.exports = angular
    .module('tickertags-shared')
    .component('papagaio', {
        template,
        controller: PapagaioController
});

PapagaioController.$inject = ['Session'];

function PapagaioController (Session) {
    this.$onInit = () => {
        const user = Session.get();
        this.isAdmin = R.equals("Admin", user.userRole);
        this.show = false;
        this.display = this.show && this.isAdmin;
    };

    this.toggle = (status) => {
        this.show = !status;
        this.display = this.show && this.isAdmin;
    };
}