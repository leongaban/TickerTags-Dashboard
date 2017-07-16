describe('Formater Factory', function() {

    // Formatter.js ////////////////////////////////////////////////////////////
    var Format;

    beforeEach(module('tickertags'));
    beforeEach(inject(function(_Format_) {
        Format = _Format_;
    }));

    it('Formater Factory is available…', function() {
        expect(Format).to.be.defined
    });

    it('toSeconds converts utc milliseconds to seconds', function() {
        var date = new Date().getTime();
        var toSec = Format.toSeconds(date);
        expect(date).to.be.a('number');
        expect(toSec).to.be.below(date);
    });

    describe('Single weighted sentiment score:', function(){
        it('returns the weighted sentiment score of a tag', function(){
            var mentions = 3;
            var total  = 10;
            var sentiment = 2;
            var weight = Format.weightedSentiment(mentions, total, sentiment);
            expect(weight).to.be.a('number');
        })
    });

    // describe('Timezone offset', function(){
    //     it('adjusts the epoch to match the user timezone', function(){
    //         function testAdjustUtcToZone(tz, expected_val) {
    //             var tz = tz || process.env.TZ;
    //             var adjEpoch = Format.adjustUtcToTimezone(0);
    //             if (adjEpoch == - (6 * 3600)) return true 
    //         	return false;
    //         }
    //         expect(testAdjustUtcToZone("America/Chicago", -6 * 3600)).to.be.true
    //         expect(testAdjustUtcToZone("America/New_York", -5 * 3600)).to.be.true
    //         expect(testAdjustUtcToZone("France/Paris", 2 * 3600)).to.be.true
    //     });
    // });

    it('floorTimesMillion will floor a Number and times by 1 million', function() {
        expect(Format.floorTimesMillion(100)).to.be.equal(100000000);
    });
});
