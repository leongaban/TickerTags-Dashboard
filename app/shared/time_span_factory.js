////////////////////////////////////////////////////////////////////////////////
/**
 * @name timeSpanFactory
 * @namespace Factory
 * @desc Stores and shares the current timespan
 */

const timeSpanFactory = angular
    .module('tickertags-shared')
    .factory('TimeSpanFactory', factory);

factory.$inject = [];

function factory() {

    let timespan = 'day';
    let sorting_period = '';

    const convertInterval = (when, type = '') => {
        let end;

        if      (type === 'vol')   end = '_quantity_epoch_desc';
        else if (type === 'trend') end = '_delta_epoch_desc';

        switch(when) {
            case 'hour':
                if (type != '') sorting_period = 'hour'+end;
                else            sorting_period = 'hour';
                return sorting_period;

            case 'day':
                if (type != '') sorting_period = 'day'+end;
                else            sorting_period = 'day';
                return sorting_period;

            case 'week':
                if (type != '') sorting_period = 'week'+end;
                else            sorting_period = 'week';
                return sorting_period;

            case 'month':
                if (type != '') sorting_period = 'month'+end;
                else            sorting_period = 'month';
                return sorting_period;
            case '3month':
                if (type != '') sorting_period = 'three_month'+end;
                else            sorting_period = 'three_month';
                return sorting_period;
            case 'year':
                if (type != '') sorting_period = 'year'+end;
                else            sorting_period = 'year';
                return sorting_period;
            case '2year':
            case 'max':
                if (type != '') sorting_period = 'two_year'+end;
                else            sorting_period = 'two_year';
                return sorting_period;
        }
    };

    const returnSortingPeriod = (span) => {
        switch(span) {
            case 'hour'   : return 'hour';  break;
            case 'day'    : return 'day';   break;
            case 'week'   : return 'week';  break;
            case 'month'  : return 'month'; break;
            case '3month' : return 'month'; break;
            case 'year'   : return 'month'; break;
            case '2year'  : return 'month'; break;
            case 'max'    : return 'month'; break;
        }
    };

    const setGranularityGroups = (timespan, groups) => {
        if (timespan === 'Past 2 years') { timespan = '2year'; }
        switch(timespan) {
            case 'minute' : return groups;
            case 'hour'   : 
            case 'day'    : return R.dropLast(1, groups); // drop last
            case 'week'   : return R.dropLast(1, R.drop(1, groups)); // drop min and last
            case 'month'  : return R.dropLast(1, R.drop(1, groups)); // drop min, hour and last
            case '3month' : return R.dropLast(2, R.drop(1, groups)); // drop min, hour, and last 2
            case 'year'   : return R.dropLast(3, R.drop(1, groups)); // drop min, hour, and last 3
            case '2year'  : return R.dropLast(4, R.drop(2, groups)); // drop min, hour, and last 4
            case 'max'    : return R.dropLast(4, R.drop(2, groups)); // drop min, hour, and last 4
        }
    };

    return {
        convertInterval,
        returnSortingPeriod,
        setGranularityGroups
    }
}

module.exports = timeSpanFactory;