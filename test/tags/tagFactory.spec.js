// ////////////////////////////////////////////////////////////////////////////////
// /**
//  * @name tickersFactory test spec
//  * @namespace Karma test spec
//  * @desc Tests the TickersFactory
//  */
var R = require("ramda");

describe('Tags Factory', function() {
    var TagsContainer;
    // var url = '/dashboard?portfolio=GOOG&sort=trend&timespan=1yr&term_id_1=2993033&ticker_1=GOOG&term_id_2=2969264&ticker_2=GOOG&term_id_3=2192868&ticker_3=GOOG';

    beforeEach(module('tickertags'));
    beforeEach(inject(function(_TagsContainer_) {
        TagsContainer = _TagsContainer_;
    }));

    it('Tags Factory is available…', function() {
        expect(TagsContainer).to.be.defined
    });

    it('tests if two term ids are the same', function() {
        const areSame = TagsContainer.areTermIDsSame;
        assert.isTrue(areSame(1, 1));
        assert.isTrue(areSame('1', 1));
        assert.isFalse(areSame(1, 3));
    });
});