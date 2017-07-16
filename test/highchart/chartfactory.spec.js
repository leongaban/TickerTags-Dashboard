describe('Chart factory', function() {
    var ChartFactory;

    var ticker = { ticker: 'GOOG' };
    var data_type = 'tweets';

    var start = 1431622110; // Thu, 14 May 2015 16:48:30 GMT
    var end   = 1463158110; // Fri, 13 May 2016 16:48:30 GMT

    var extremes = {
        start : start,
        end   : end
    };

    beforeEach(module('tickertags'));
    beforeEach(inject(function(_ChartFactory_) {
        ChartFactory = _ChartFactory_;
    }));

    it('ChartFactory is available…', function() {
        expect(ChartFactory).to.be.defined
    });

    it('ChartFactory storeTicker & getTicker: stores and retrieves a ticker object', function() {
        ChartFactory.saveTicker(ticker);
        expect(ChartFactory.getTicker()).to.equal(ticker);
    });

    it('ChartFactory.setDataType: sets data type', function() {
        ChartFactory.setDataType(data_type);
        expect(ChartFactory.getDataType()).to.equal(data_type);
    });
    
    it('If dataType is undefined, return tweets', function() {
        ChartFactory.setDataType(undefined);
        expect(ChartFactory.getDataType()).to.be.equal(data_type);
    });

    it('If tweetType is undefined, expect incidences', function() {
        ChartFactory.rangeType(undefined);
        expect(ChartFactory.getRangeType()).to.equal('incidences');
    });

    it('Set start and end dates and return extremes object', function() {
        ChartFactory.saveExtremes(start, end);
        expect(ChartFactory.getExtremes()).to.deep.equal(extremes);
    });

});