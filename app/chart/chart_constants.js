/**
 * Created by paulo on 10/20/16.
 */
module.exports = angular.module('tickertags-chart')
    .constant('CHART', {
        axis:{
            id:'default'
        },
        transition: {
            delay: 500
        },
        tooltip:{
            pointFormat: {
                priceline: `<p style="color:white; margin-bottom:-10px;"><span style="color:{series.color}">{series.name}</span><b> $ {point.y}</b></p><br/>`,
                positiveSentiment: `<p style="color:white; margin-bottom:-10px;"><span style="color:{series.color}">Positive sentiment</span><b style="white"> {point.y}%</b></p><br/>`,
                negativeSentiment: `<p style="color:white; margin-bottom:-10px;"><span style="color:{series.color}">Negative sentiment</span><b style="white"> {point.y}%</b></p><br/>`
            }
        }
    });