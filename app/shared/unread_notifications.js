/**
 * Created by paulo on 11/3/16.
 */
module.exports = angular
    .module('tickertags-shared')
    .factory('Unread', unread);

unread.$inject = [
    '$document',
    'Util'];

function unread(
    $document,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const ui = Util.uiSafe;
    const capitalize = Util.capitalize;
    const template = (alert) => `${capitalize(ui(alert.type))} for [${alert.tickers[0]}] - ${alert.type != 'insight' ? alert.term : ''} ${alert.percent_change || 0}%`;
    const title = `TickerTags Dashboard`;
    const setTitle = (copy) => $document[0].title = copy;
    let COUNT = 0;

    const reset = function() {
        COUNT = 0;
        setTitle(`${title}`);
    };

    const increase = function(user, alert){
        COUNT++;
        setTitle(`[${COUNT}] ${title}`);
        if (R.equals("Admin", user.role)) {
            let annotated = 'annotated' in alert;
            let action = annotated ? 'annotated': 'received';
            notify(`Alert ${action}...`, alert);
        }
    };

    function ask () {
        console.log('request permission')
        Notification.requestPermission().then((result) => {
            if (result === 'denied') {
                console.log('Permission wasn\'t granted. Allow a retry.');
                alert('Permission wasn\'t granted. Allow a retry.');
                return;
            }
            if (result === 'default') {
                console.log('The permission request was dismissed.');
                alert('The permission request was dismissed.');
                return;
            }
            new Notification('You already set the permission')
            // Do something with the granted permission.
        });
    }

    function notify(title, alert) {
        const body = template(alert);
        let notification;

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            return alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            notification = new Notification(title, {body: body, icon:'assets/imgs/ticker-tags-black.png'});
        }

        else {
            console.log('Notifications have not been granted');
        }

        return notification;

        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them any more.
    }

    function test() {
        let end = Math.round(new Date().getTime()/1000.0);
        let start = getRandomArbitrary((end - 2*24*60*60*1000),end);
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        let alert = {
            end_epoch: end,
            formatted_date_difference: "1 min ago",
            link: Array[0],
            note: "",
            percent_change: Math.round(Math.random() * 100),
            search_preview: Array[1],
            start_epoch: start,
            term: "testing notification",
            term_id: 123456,
            term_trend_id: 123456000,
            tickers: ['AAPL'],
            title: "",
            twitter_preview: "",
            type: "spike"
        };
        let annotated = 'annotated' in alert;
        let action = annotated ? 'annotated': 'received';
        return notify(`Testing ${action} notification...`, alert);
    }

    return {
        count: COUNT,
        reset: reset,
        increase: increase,
        test : test,
        ask: ask
    }
}