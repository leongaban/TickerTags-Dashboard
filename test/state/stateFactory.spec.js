describe('State Factory', function(){
    var StateFactory;

    beforeEach(module('tickertags'));
    beforeEach(inject(function(_StateFactory_) {
        StateFactory = _StateFactory_;
    }));

    it('should set a value to an object in the state manager factory', function(){
        var state = {};
        StateFactory.setProperty(state, 'prop', true);
        expect(state).to.have.property('prop');
    })
    it('should return a property stored in the object', function(){
        var state = { prop: 1};
        var property = StateFactory.readProperty(state, 'prop');
        expect(property).to.equal(1);
    });
});