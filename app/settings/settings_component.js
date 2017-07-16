////////////////////////////////////////////////////////////////////////////////
/**
 * @name settingsComponent
 * @namespace Component
 * @desc Component for the Settings.parent scope
 */
import template from './settings.html';

module.exports = angular
    .module('tickertags-settings')
    .controller('SettingsCtrl', SettingsCtrl)
    .component('settingsComponent', {
        template,
        controller: SettingsCtrl,
        controllerAs: 'stc',
        transclude: true,
        bindings: {}
    });

SettingsCtrl.$inject = [
    '$cookies',
    '$state',
    'AuthFactory'];

function SettingsCtrl(
    $cookies,
    $state,
    AuthFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.logout = () => AuthFactory.webservice_logout().then(() => {
        const cookies = $cookies.getAll();
        angular.forEach(cookies, function(value, key) {
            $cookies.remove(key);
        });

        $state.go('login', {}, { reload: true }).then(() => window.location.reload(true));
    });

    this.clickSettingsTab = (type) => this.default = type === 'default';

    this.$onInit = () => {
        this.default = $state.params.default;
    };
}