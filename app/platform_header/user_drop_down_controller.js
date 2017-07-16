export default function UserDropDownController(
	$cookies,
	$state,
	$stateParams,
	AuthFactory,
	Dashboard) {

	////////////////////////////////////////////////////////////////////////////
	this.gotoSettings = () => {
		const lastState = R.clone($stateParams);
		Dashboard.savePreviousState(lastState);
		$state.go('settings.default', { default: true });
	};

    this.logout = () => AuthFactory.webservice_logout().then((res) => {
    	const cookies = $cookies.getAll();
	    angular.forEach(cookies, function(value, key) {
	        $cookies.remove(key);
	    });

    	$state.go('login', {}, { reload: true }).then(() => window.location.reload(true));
    });

    this.cancel = () => this.$close();
}