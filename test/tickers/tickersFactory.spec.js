// ////////////////////////////////////////////////////////////////////////////////
// /**
//  * @name tickersFactory test spec
//  * @namespace Karma test spec
//  * @desc Tests the TickersFactory
//  */

describe('Tickers Factory', function() {
    var tickersFactory;
    var ticker = { ticker: 'SPY' };
    var appleTicker = {
        amount: -0.15,
        company: "Apple Inc",
        current_ask: 95.76,
        current_bid: 95.75,
        current_change_amount: -0.15,
        current_changepercent: -0.16,
        current_high: 96.89,
        current_last: 95.76,
        current_low: 95.35,
        current_open: 96.25,
        current_prevclose: 95.91,
        direction: "negative",
        exchange: "NASDAQ",
        industry: "TelecommunicationsEquipment",
        longname: "Apple Inc",
        percent: -0.16,
        price: 95.76,
        selected: true,
        ticker: "AAPL"
    }

    beforeEach(module('tickertags'));
    beforeEach(inject(function(_TickersFactory_) {
        tickersFactory = _TickersFactory_;
    }));

    it('Tickers Factory is available…', function() {
        expect(tickersFactory).to.be.defined
    });

    // it('storeTicker: store a ticker', function() {
    //     tickersFactory.storeTicker(ticker);
    //     expect(tickersFactory.getTicker()).to.equal(ticker)
    // });

    it('getTicker: retrive the current ticker', function() {
        var get = tickersFactory.getTicker;
        tickersFactory.storeTicker(ticker);
        expect(get()).to.equal(ticker);
    });

    // it('getTicker: retrive just ticker name SPY', function() {
    //     var tickerName = tickersFactory.getTicker('justName');
    //     expect(tickerName).to.equal('SPY');
    // });

    it('get Ticker price', function() {
        var tickerPrice = tickersFactory.returnTickerPrice(appleTicker);
        expect(tickerPrice).assert.isNumber;
    })
});
