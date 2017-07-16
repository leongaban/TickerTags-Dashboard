export default function RenewController (
    $cookies,
    $scope,
    $state,
    user,
    AuthFactory) {

    ////////////////////////////////////////////////////////////////////////////
    this.$onInit = () => {
        // console.log('renew onInit user', user)
        $scope.username = user.username;
        $scope.role = user.userRole;
        console.log('$scope.role', $scope.role)
        // if (user.userRole === "Pending") {
        //     $scope.
        // }
    };

    // $scope.logout = () => AuthFactory.webservice_logout().then(() => {
    //     const cookies = $cookies.getAll();
    //     angular.forEach(cookies, function(value, key) {
    //         $cookies.remove(key);
    //     });

    //     $state.go('login', {}, { reload: true }).then(() => window.location.reload(true));
    // });

    $scope.logout = () => $state.go('login', {}, { reload: true }).then(() => window.location.reload(true));
}