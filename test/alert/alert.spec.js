describe('Alert manager', function(){
    
    var Alerts;
    
    beforeEach(module('tickertags'));
    beforeEach(inject(function(_Alerts_){
        Alerts = _Alerts_;
    }));
    it('should be defined', function(){
        assert.isDefined(Alerts.alertType);
    });
    it('should include the alert type based on the alert settings', function(){

        var settings = { insight: true, spike: true};
        var typesParams = Alerts.alertType(settings);
        expect(typesParams).to.be.a('string');
        expect(typesParams).to.equal('insight,spike');
    });
    xit('should only call the function if settings are set to true', function(){

        var renderFN = sinon.spy();
        Alerts.shouldRender(true, renderFN);
        assert.isTrue(renderFN.called);

    });
    it('should return an empty function instead of the render function', function () {

        var renderFN = sinon.spy();
        Alerts.shouldRender(false, renderFN);
        assert.isFalse(renderFN.called);
    })
    
    
});