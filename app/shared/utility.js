module.exports = angular
    .module('tickertags-shared')
    .factory('Util', Utility);

Utility.$inject = ['TimeConstants', 'TimeSpanFactory'];

function Utility(TimeConstants, TimeSpanFactory) {
    const intervals = ['minute', 'hour', 'day', 'week', 'month', 'year', '2year', 'max'];

    const timerange = (start, end) => moment.unix(start).to(moment.unix(end), true);

    const timespan = (start_epoch, end_epoch) => {
        const [duration, interval] = R.takeLast(2, timerange(start_epoch, end_epoch).split(' '));
        const next = R.or(isNaN(parseInt(duration)), R.gte(parseInt(duration), 1));
        const index = R.findIndex(R.equals(moment.normalizeUnits(interval)),  intervals);
        const location = next ? index + 1 : index;
        return R.nth(location, intervals);
    };

    const granularity = (timespan) => {
        const groupings = TimeConstants.spans;
        // grouping: find grouping based on timespan
        const grouping = R.findIndex(R.equals(timespan), groupings);
        // sliceIndex: if timespan does not exist assumes it is longer than 1 month
        const sliceIndex = R.equals(-1, grouping) ? 3 : grouping;
        // available: take available groupings based on timespan
        const available = R.take(R.add(1, sliceIndex), groupings);
        // Display appropriate granularity group for timespan
        this.groups = TimeSpanFactory.setGranularityGroups(timespan, available);
        // Set selected granularity active state
        return R.takeLast(1, this.groups);
    };

    const isFrequency = (value) => value === 'frequency' || value === 'incidences';

    const isEqual = (isThis, equalTo) => R.equals(isThis, equalTo);

    const equals = R.curry(isEqual);

    const notEqual = R.complement(R.equals);

    const existIndex = notEqual(-1);

    const isNot = R.compose(R.not, R.match);

    const isTrue = R.equals(true);

    const isFalse = R.compose(R.not, isTrue);

    const isType = R.type;

    const isSpike = R.propEq("type", "spike");

    const isInsight = R.propEq("type", "insight");

    const isMomentum = R.propEq("type", "momentum");

    const notEmpty = R.compose(R.not, R.isEmpty);

    const notIdentical = R.compose(R.not, R.identical);

    const notUndefined = R.compose(R.not, R.isNil);

    const uniqFlat = R.compose(R.uniq, R.flatten);

    const uniques = R.uniq;

    // http://stackoverflow.com/a/40011873/3196675
    const capitalize = R.compose(R.join(''), R.juxt([R.compose(R.toUpper, R.head), R.tail]));

    const floor = (x) => Math.floor(x);

    const getAlertObject = (aArray) => Array.isArray(aArray) ? R.head(aArray) : aArray;

    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const encodeTicker = (ticker) => {
        const tickerString = ticker.ticker ? ticker.ticker : ticker;
        return tickerString.replace(/\//i, '%2F');
    };

    const changeKeyName = R.curry((from, to, object) => {
        const content = object[from];
        const property = R.lensProp(to);
        const addProperty = R.set(property, content);
        const removeProperty = R.omit([from]); // Ramda omit needs an Array type to work properly
        const swapProperty = R.compose(removeProperty, addProperty);
        return swapProperty(object);
    });

    const change = (alert) => {
        const typeProp = R.propEq('type');
        const assocType = R.assoc('type');
        alert = typeProp('spike', alert) ? assocType('tag_breaking', alert) : alert;
        alert = typeProp('momentum', alert) ? assocType('tag_momentum', alert) : alert;
        alert = typeProp('insight', alert) ? assocType('tag_insight', alert) : alert;
        return alert
    };

    const supportLegacyAlert = (body, serverSafe = true) => {
        const changeKey = serverSafe ? changeKeyName : R.flip(changeKeyName);
        const changeInsight = changeKey('tag_insight', 'insight');
        const changeSpike = changeKey('tag_breaking', 'spike');
        const changeMomentum = changeKey('tag_momentum', 'momentum');
        const safe = R.compose(change, changeInsight, changeSpike, changeMomentum);
        return safe(body);
    };

    // const getParameterByName = (name, url) => {
    //     if (!url) url = window.location.href;
    //     name = name.replace(/[\[\]]/g, "\\$&");
    //     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    //         results = regex.exec(url);
    //     if (!results) return null;
    //     if (!results[2]) return '';
    //     return decodeURIComponent(results[2].replace(/\+/g, " "));
    // };

    const queryStringBooleans = (params) => {
        params.chart_alerts = params.chart_alerts === 'true';
        params.chart_max = params.chart_max === 'true';
        params.feed_open = params.feed_open === 'true';
        params.tags_open = params.tags_open === 'true';
        params.links = params.links === 'true';
        params.retweets = params.retweets === 'true';
        params.start_epoch = params.start_epoch;
        params.end_epoch = params.end_epoch;
        return params;
    };

    const uiSafe = (alert) => R.equals('spike', alert) ? 'breaking' : alert;

    const sortByKey = (array, key) => {
        return array.sort((a, b) => {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    };

    const validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    return {
        granularity,
        timespan,
        isFrequency,
        isEqual,
        equals,
        existIndex,
        uiSafe,
        capitalize,
        supportLegacyAlert,
        // getParameterByName,
        queryStringBooleans,
        isNot,
        isTrue,
        isFalse,
        isType,
        isSpike,
        isInsight,
        isMomentum,
        notEmpty,
        notIdentical,
        notUndefined,
        uniqFlat,
        uniques,
        floor,
        getAlertObject,
        getRandomNumber,
        encodeTicker,
        changeKeyName,
        sortByKey,
        validateEmail
    };
}

////////////////////////////////////////////////////////////////////////////////
// import TimeSpan from './time_span_factory';

// export default class Utility {

//     constructor() {
        
//     }

//     granularity(timespan) {
//         const timeFactoryDay = new TimeSpan('day')
//         const timeFactoryWeek = new TimeSpan('week')
        
//         const groupings = TimeConstants.spans;
//         // grouping: find grouping based on timespan
//         const grouping = R.findIndex(R.equals(timespan), groupings);
//         // sliceIndex: if timespan does not exist assumes it is longer than 1 month
//         const sliceIndex = R.equals(-1, grouping) ? 3 : grouping;
//         // available: take available groupings based on timespan
//         const available = R.take(R.add(1, sliceIndex), groupings);
//         // Display appropriate granularity group for timespan
//         this.groups = timeFactory.setGranularityGroups(timespan, available);
//         // Set selected granularity active state
//         return R.takeLast(1, this.groups);
//     };
// }