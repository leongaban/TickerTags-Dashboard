const last = R.last;
// ////////////////////////////////////////////////////////////////////////////////
// /**
//  * @name tickersFactory test spec
//  * @namespace Karma test spec
//  * @desc Tests the TickersFactory
//  */

describe('FeedFactory Factory', function() {
    // var $websocketBackend;
    // var $httpBackend;
    // var FeedFactory = null;
    // var AuthFactory;
    // var ApiFactory;
    // var UserFactory;
    // var Session;
    // var api;

    // const settings = {
    //     alert_settings: {
    //         "email_notification": false,
    //         "tag_insight": false,
    //         "tag_momentum": false,
    //         "port_tickers": ["AA", "AAPL", "BA", "BBBY", "CCE", "DIS", "FIT", "GOOG", "MSFT", "SEAS", "TWTR", "V"],
    //         "id": 1,
    //         "tag_sentiment": true,
    //         "user_id": 1,
    //         "email_summary": false,
    //         "cash_sentiment": true,
    //         "event_breaking": true,
    //         "sensitivity": "",
    //         "tag_breaking": false,
    //         "cash_momentum": true,
    //         "chart": false,
    //         "all_tickers": false,
    //         "sms_number": null,
    //         "email_realtime": false,
    //         "enabled": false,
    //         "fav_tags": [10403, 10427, 12776, 21119, 33324, 155506, 1811769, 2221432, 2686471, 2963853, 2969604, 2999520, 3000394, 3053843],
    //         "cash_breaking": true,
    //         "sms_notification": false
    //     }
    // }

    // const breaking = {
    //     formatted_date_difference    : '1 min ago',
    //     percent_change               : 99,
    //     start_epoch                  : 1463961600,
    //     search_preview               : [''],
    //     standard_deviations          : 3.44694,
    //     term                         : '"TEST WEBSOCKET"',
    //     term_id                      : 21119,
    //     tickers                      : ['GOOG'],
    //     twitter_preview              : "This is a websocket test!",
    //     type                         : "spike"
    // };


    // const insight_test_message = {
    //     approved                     : 1,
    //     id                           : 29,
    //     sort                         : "trend",
    //     term_name_1                  : "\"apple\"",
    //     user_id                      : 134,
    //     description                  : "Testing insight",
    //     formatted_date_difference    : "60 sec ago",
    //     term_id_1                    : 10427,
    //     term_id_2                    : null,
    //     term_id_3                    : null,
    //     url                          : "/dashboard&ticker_1=AAPL&term_id_1=10427&sort=vol&timespan=2year&start_epoch=1409675035&end_epoch=1472747035",
    //     ticker_1                     : "AAPL",
    //     ticker_2                     : "",
    //     ticker_3                     : "",
    //     title                        : "APPLE",
    //     timespan                     : "2year",
    //     start_epoch                  : 1409675035,
    //     end_epoch                    : 1472747035,
    //     portfolio                    : "",
    //     searched                     : "",
    //     top                          : "",
    //     sort                         : "vol",
    //     type                         : "insight"
    // };

    // ////////////////////////////////////////////////////////////////////////////
    // beforeEach(module('tickertags', 'ngWebSocket', 'ngWebSocketMock'));

    // beforeEach(inject(function(_api_, _FeedFactory_, _$websocketBackend_, _$httpBackend_, _UserFactory_) {
    //     UserFactory          = _UserFactory_;
    //     FeedFactory          = _FeedFactory_;
    //     $websocketBackend    = _$websocketBackend_;
    //     $httpBackend         = _$httpBackend_
    //     api                  = _api_


    //     $websocketBackend.mock();
    //     $websocketBackend.expectConnect('ws://localhost:8080/api');
    //     $websocketBackend.expectSend({data: JSON.stringify({test: true})});


    //     $httpBackend
    //         .when('GET', api.alerts)
    //         .respond(200, { foo: 'bar' });
    // }));


    // it('FeedFactory is available…', function() {
    //     assert.isDefined(FeedFactory);
    // });

    // describe.skip("INIT", function(){
    //     describe('websocket path creation:different paths for admins and users', function(){
    //         const suffix = R.compose(R.last, R.split('/'))
    //         it('admins', function(){
    //             const adminPath = FeedFactory.path(true);
    //             expect(suffix(adminPath)).to.be.equal("admin")
    //         })
    //         it("creates a general path for users", function(){
    //             const userPath = FeedFactory.path(false)
    //             expect(suffix(userPath)).to.be.equal("ws")
    //         })
    //     })
    //     it("on load should get the default feed: 20 alerts of any kind based on the settings", function (done) {
    //         this.timeout(2000)

    //         return new Promise(function(resolve){
    //             resolve([]);
    //         })
    //         // return FeedFactory.loadFeed()
    //             .then(
    //             function (result) {
    //                 result.should.equal([]);
    //                 done();
    //             },
    //             function (err) {
    //                 done(err);
    //             }
    //         );
    //     })
    //     it('websocket is not blocked by default', function() {
    //         expect(FeedFactory.WEB_SOCKET_IS_NOT_BLOCKED).to.be.true
    //     });
    //     it('alerts is empty by default', function(){
    //         expect(FeedFactory.pushedAlerts).to.be.an('array')
    //         expect(FeedFactory.pushedAlerts).to.be.empty;
    //     });

    // })
    // describe("APPEND: append an alert to the feed", function(){

    //     describe("when is 1 alert", function(){
    //         const alerts =    Array.from({length:20},(v,k)=> breaking)

    //         it("by incoming websocket message", function(){
    //             assert(Array.isArray(alerts))
    //             assert.lengthOf(alerts, 20)
    //             const updatedFeed = FeedFactory.incomingMessage({data:JSON.stringify(breaking)});
    //             assert.lengthOf(updatedFeed, 21)

    //         })
    //         it("by annotating an alert(it replaces itself on the feed", function(){})

    //     })
    //     describe("when is 20 alerts", function(){
    //         it("on initialization", function(){})
    //         it("when on infinite scrolling it to get fresh alerts (api call)",function(){})
    //     })

    // })
    
    // describe("STATES:", function () {
    //     it("should always have base20 items on it")
    //     it("should have a representation of it by id")
    // })

    // describe("INCOMING: alerts being fed into the feed", function(){
    //     it("curators: receive a notification window and a title representation", function(){})
    //     it("clicking on an alert's plotline from the chart", function(){})
    //     it("initiated by a websocket message", function(){})


    // })

    // describe("CURATORS", function(){
    //     describe("when annotating an alert, they can", function(){
    //         it("approve", function(){})
    //         it("deny", function(){})
    //         it("reject", function(){})
    //     })
    //     describe("can submit alerts, both insight and breaking/momentum", function(){
    //         it("insights alert type submission", function(){})
    //         it("breaking/momentum alert type submission", function(){})
    //     })

    // })

    // describe("CLICK: clicking on feed item <chart> button", function(){
    //     it("sets the alert ticker on the ticker tickers_panel", function(){})
    //     it("sets the alert tags the tickers_panel", function(){})
    //     describe("sets start and end epochs on charts on the following pattern", function(){
    //         it("breaking: no padding necessary", function(){})
    //         it("momentum:")
    //         it("insight:")
    //     })
    // })

    // describe('Url to be stored when updating an alert ', function() {
    //     it('created url is based on the alert type', function() {
    //         expect(FeedFactory.isInsight(insight_test_message)).to.be.true;
    //         expect(FeedFactory.isInsight(breaking)).to.be.false;
    //     });
    //
    //     it('create an Insight URL from Alert object', function() {
    //         expect(FeedFactory.createInsightURL(insight_test_message)).to.be.a('string');
    //     });
    // });
});
