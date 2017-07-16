// ////////////////////////////////////////////////////////////////////////////////
// /**
//  * @name tickersFactory test spec
//  * @namespace Karma test spec
//  * @desc Tests the TickersFactory
//  */

describe('ApiFactory Factory', function() {
    
    beforeEach(module('tickertags'));
    beforeEach(inject(function(_ApiFactory_) {
        ApiFactory = _ApiFactory_;
    }));

    it('Api Factory is available…', function() {
        expect(ApiFactory).to.be.defined
    });

    it('API POST checkPassword: check current password', function() {
        ApiFactory.checkPassword();
    });
});