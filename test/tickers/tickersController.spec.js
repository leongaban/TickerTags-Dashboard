
describe('Tickers Controller', function() {

    var vm;
    var $controller;
    var scope;
    var $rootScope;
    beforeEach(module('tickertags'));

    beforeEach(inject(function(_$controller_, _$rootScope_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        
        vm = $controller('TickersPanelCtrl', { $scope:scope });

    }));
    it('tickers container', function(){
        assert.isArray(vm.tickers);
    })
});
