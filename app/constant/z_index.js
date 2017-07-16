/**
 * Created by paulo on 10/20/16.
 */
module.exports = angular.module('tickertags').constant('zIndex', {
    axis:{
        default: 100,
        priceline: 10,
        sentiment: 10,
        alert: 1,
        plotline: 10,
        plotband: 10
    },
    series:{
        priceline: 50,
        tag: 10,
        sentiment:10,
        alert: 1
    },
    rendered:{
        plotline: 1
    }
});