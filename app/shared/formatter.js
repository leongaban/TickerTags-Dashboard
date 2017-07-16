export default function Formatter(EPOCH) {

    const isMillion = (number) => R.gte(number, 1000000);

    const capFirstLetter = (txt) => _.upperFirst(txt);

    const human = (number, suffix = '') => `${number.toFixed(2)} ${suffix}`;

    const places = (number) => {
        if (R.gte(number, 1000000)) {
            return human(R.divide(number, 1000000), "MM");
        }
        else if (R.and(R.lte(number, 1000000),R.gte(number, 1000))) {
            return human(R.divide(number, 1000), "K");
        }
        else {
            return human(number);
        }
    };

    const removeQuotes = (str) => str.replace(/['"]+/g, '');

    const frequencyToMentions = (str) => str.replace(/Frequency/i, 'Mentions');

    const removeNegativeZero = (value) => R.equals(-0, value) ? 0 : value;

    const removeNaN = (value) => isNaN(value) ? 0 : value;

    const prettyPercent = R.compose(Math.round, R.multiply(100),removeNegativeZero, removeNaN, R.apply(R.divide));

    const toMilliseconds = R.multiply(1000);

    const sentimentPercent = (sentiment, mention) => R.map(prettyPercent,R.zip(sentiment, mention));

    const combined = (arrays) => arrays.reduce(R.compose(R.map(R.sum),R.zip));

    const frequencyMultipler = R.multiply(100000000);

    const mentionsMultipler = R.multiply(10);

    const sentimentData = (tags) => {
        const sample = R.head(tags);
        if (sample.sentiment) {
            const positiveSentiment = R.map(R.prop('positive'), tags);
            const negativeSentiment = R.map(R.prop('negative'), tags);
            const epochs = R.prop('start_epoch', R.head(tags));
            const mentionIncidence = R.map(R.prop('sentimentIncidence'), tags);
            const totalIncidence   = combined(mentionIncidence);
            const weightedPositive = sentimentPercent(combined(positiveSentiment), totalIncidence);
            const weightedNegative = sentimentPercent(combined(negativeSentiment), totalIncidence);
            return {
                positive: weightedPositive,
                negative: weightedNegative,
                epochs: epochs
            }
        }

        return {
            positive: [],
            negative: [],
            epochs: []
        }
    };

    const getDatesRange = (newInterval, isTweet = true) => {
        const rightDate = new Date();
        const leftDate  = new Date();
        const day = 86400;
        const earliestDate = isTweet ? EPOCH.earliest.tweets : EPOCH.earliest.social;
        const currentDateMilliseconds = (new Date).getTime();
        const currentDateSecs = Math.floor(currentDateMilliseconds / 1000);
        const epochDifference = currentDateSecs - earliestDate;
        const maxDays = Math.floor(epochDifference / day);

        if (newInterval == "hour") {
            leftDate.setHours(rightDate.getHours() - 1);
        } else if (newInterval == "day") {
            leftDate.setDate(rightDate.getDate() - 1);
        } else if (newInterval == "week") {
            leftDate.setDate(rightDate.getDate() - 7);
        } else if (newInterval == "month") {
            leftDate.setDate(rightDate.getDate() - 30);
        } else if (newInterval == "3month") {
            leftDate.setDate(rightDate.getDate() - 90);
        } else if (newInterval == "year") {
            leftDate.setDate(rightDate.getDate() - 365);
        } else if (newInterval == "2year") {
            leftDate.setDate(rightDate.getDate() - 730);
        } else if (newInterval == "max") {
            leftDate.setDate(rightDate.getDate() - maxDays);
        }

        return [leftDate, rightDate];
    };

    const castNumber = (number) => {
        return number === undefined || number === null || isNaN(number) ? 0 : number;
    };

    const incidences = (quotes) => {
        return _.map(quotes.frequency_counts, (quote) => Math.floor(quote.incidence));
    };

    const floorTimesMillion = (number) => Math.floor(number * 1000000);
    const million = R.compose(Math.floor,R.multiply(1000000));

    const prepare = (quotes) => {
        _.each(quotes.frequency_counts, (quote) => {
            quote.total = quote.incidence;
            quote.incidence = Math.floor(quote.incidence);
            quote.incidence_negative_sentiment    = Math.floor(quote.incidence_negative_sentiment);
            quote.incidence_neutral_sentiment     = Math.floor(quote.incidence_neutral_sentiment);
            quote.incidence_positive_sentiment    = Math.floor(quote.incidence_positive_sentiment);
            quote.incidence_non_promo             = Math.floor(quote.incidence_non_promo);
            quote.incidence_non_retweet           = Math.floor(quote.incidence_non_retweet);
            quote.incidence_non_retweet_non_promo = Math.floor(quote.incidence_non_retweet_non_promo);
            quote.tweets = Math.floor(quote.tweets * 10);
        });

        return (type) => _.map(quotes.frequency_counts, (quote) => quote[type]);
    };

    const priceline = (quote, index, array) => {
        const next = array[index + 1];
        const start = quote.start_epoch;
        const price = quote.price;
        const end = next ? next.start_epoch : start;
        return [toMilliseconds(start), price, toMilliseconds(end)];
        // return [toMilliseconds(start), price]
    };

    const quotes = (quotes) => {
        const qs = R.clone(quotes.data.quotes);
        return qs.map(priceline);
    };

    const firehoseOFFSET = R.multiply(10);

    const mentions = (quotes, incidence) => R.map((quote) => firehoseOFFSET(Math.floor(quote.total * R.prop(incidence, quote))), quotes.frequency_counts);

    const safeEpoch = (type, epoch, timespan) => {
        if (epoch) {
            return epoch;
        }
        else {
            const startEnd = createStartEnd(timespan);
            return startEnd[type];
        }
    };

    const createStartEnd = (interval, order='asc') => {
        const dates      = getDatesRange(interval);
        const start_date = dates[0].getTime();
        const end_date   = dates[1].getTime();
        const start      = toSeconds(start_date);
        const end        = toSeconds(end_date);
        const group      = groupStartEnd(start, end);
        return  { start, end, group, order };
    };

    const interval = (interval) => {
        const minute = 60;
        const hour   = minute * 60;
        const day    = hour * 24;

        switch (interval) {
            case 'min'  : return minute;
            case 'hour' : return hour;
            case 'half' : return 12 * hour;
            case 'day'  : return day;
            case '1d'   : return day;
            case '3d'   : return 3 * day;
            case 'week' : return 7 * day;
        }
    };

  const grouping = (diff) => {
        // console.log(`groupStartEnd start_epoch ${start_epoch} - end_epoch ${end_epoch}`)
        //  var group = 7 * 24 * 60 * 60;
        let group = 24 * 60 * 60;
        let interval;

         //12 hours
        if (diff <= 12 * 60 * 60) {
            group = 60;
            interval = '1 minute';
        }
        // 3 days
        else if (diff <= 3 * 24 * 60 * 60) {
            group = 15 * 60;
            interval = '15 minutes';
        }
        // 2 weeks
        else if (diff <= 2 * 7 * 24 * 60 * 60) {
            group = 60 * 60;
            interval = '1 hour';
        }
        //6 weeks
        else if (diff <= 6 * 7 * 24 * 60 * 60) {
            group = 6 * 60 * 60;
            interval = '6 hours';
        }
        //18 weeks
        else if (diff <= 18 * 7 * 24 * 60 * 60) {
            group = 24 * 60 * 60;
            interval = '1 day';
        }
        //1 mo
        else if (diff < 30 * 24 * 60 * 60) {
            group = 24 * 60 * 60;
            interval = '1 day';
        }
        // 3 mo
        else if (diff <= 90 * 24 * 60 * 60) {
            group = 24 * 60 * 60;
            interval = '1 day';
        }
        // 6 mo
        else if (diff <= 180 * 24 * 60 * 60) {
            group = 24 * 60 * 60;
            interval = '1 day';
        }
        // 1 yr
        else if (diff >= 365 * 24 * 60 * 60) {
            group = 7 * 24 * 60 * 60;
            interval = '1 week';
        }
        // 2 yr
        else if (diff >= 2 * 365 * 24 * 60 * 60) {
            group = 2 * 7 * 24 * 60 * 60;
            interval = '2 weeks';
        }
//         console.log(interval, group);
        return group;
     };
    const groupStartEnd = (start_epoch, end_epoch) => {
        // console.log(`groupStartEnd start_epoch ${start_epoch} - end_epoch ${end_epoch}`)
        //  var group = 7 * 24 * 60 * 60;
        const diff = end_epoch - start_epoch;
        return grouping(diff)
     };

    const toSeconds = (date) => { return Math.round(date / 1000); };

    const createDate = (alert) => {
        const date = new Date(parseFloat(alert.start_epoch+'000'));
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return month + '/' + day + '/' + year;
    };

    const encodeURI = (str) => {
        return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16));
    };

    const truncate = (text, size) => {
        let returnedText = '';

        if (text) {
            const textLen = text.length;

            if (textLen > size) {
                const cutName = text.slice(0, size);
                returnedText = cutName+'...';
            } else {
                returnedText = text;
            }
        }

        return returnedText;
    };

    const timespan = (qtd, interval) => {
        if (!qtd) throw new Error(`qtd cannot be undefined`);
        const prefix = qtd === 1 ? `` : qtd;
        return `${prefix}${interval}`;
    };

    const asSeconds = (group) => moment.duration(1, group).asSeconds();

    ////////////////////////////////////////////////////////////////////////////
    return {
        grouping,
        isMillion,
        capFirstLetter,
        places,
        removeQuotes,
        frequencyToMentions,
        frequencyMultipler,
        mentionsMultipler,
        sentimentData,
        getDatesRange,
        prepare,
        incidences,
        quotes,
        mentions,
        safeEpoch,
        createStartEnd,
        groupStartEnd,
        castNumber,
        floorTimesMillion,
        toSeconds,
        createDate,
        million,
        interval,
        toMilliseconds,
        encodeURI,
        truncate,
        timespan,
        firehoseOFFSET,
        asSeconds
    };
}
