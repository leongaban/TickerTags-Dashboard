////////////////////////////////////////////////////////////////////////////////
/**
* @name TooltipFactory
* @namespace Factories
* @desc Stores and gets the current tooltip point data
*/

module.exports = angular.module('tickertags-chart').factory('Tooltip', Tooltip);

Tooltip.$inject = [
    '$stateParams',
    'Format'];

function Tooltip(
    $stateParams,
    Format) {

    ////////////////////////////////////////////////////////////////////////////
    const capitalize = _.capitalize;

    const humanDate = (epoch) => moment.unix(epoch).format("MM/DD/YY hh:mm A");

    const alertType = (type) => R.equals("spike", type) ? "breaking" : type;

    const colorPercentChange = (change) => R.gte(0, change) ? "#FF6565" : "#00D88C";

    const alertInfo = function(alert) {
        switch (alert.type) {
            case 'momentum':
                return `<span style="margin-top:5px; font-size:10px; color:#ccc"> from ${humanDate(alert.start)} to ${humanDate(alert.end)} </span>`;
                break;
            default:
                return `<span style="margin-top:5px; font-size:10px; color:#ccc">at ${alert.timestamp} </span>`;
        }
    };

    const alert = function() {
        const type = alertType(this.type);
        const percentChange = this.percentChange ? this.percentChange: 0;
        const percentChangeColor = colorPercentChange(percentChange);
        return `<p style="color:white;"><span style="color:#B0171F">${capitalize(type)} alert</span> ${this.name} <b style="color:${percentChangeColor}">${Math.round(percentChange)}%</b> ${alertInfo(this)}</p>`;
    };

    const checkGranularity = (group) => {
        switch(group) {
            case 'minute': case 'hour': case 'day': return true; break;
            default : return false; break;
        }
    };

    const setStart = (start) => start ? `Start ${start} | ` : ``;

    const setDates = function (_this, _start = null, end) {
        const start = setStart(_start);
        return `<span style="color:#ccc; font-size:10px;">${start}${end}</span><br/>
                <p style="color:white; margin: 5px 0 -10px 0;"><span style="color:${_this.series.color}">${_this.series.name}</span><b> $ ${_this.y}</b></p><br/>`;
    };

    const priceline = function() {
        const smallGranularity = checkGranularity($stateParams.group);
        /* human date expects unix in seconds instead of milliseconds so is important to divide the start epoch for 1000 */
        const startDate = humanDate(this.x / 1000);
        const endDate = humanDate(this.end / 1000);
        return smallGranularity ? setDates(this, null, endDate) : setDates(this, startDate, endDate);
    };

    const tag = function() {
        const range = R.equals('incidences', $stateParams.social) ? 'Frequency' : 'Mentions';
        return `<p style="color:white; margin-bottom:-10px;"><span style="color:${this.color}">${this.series.name} </span><b>${Format.places(this.y)}</b><span style="color:${this.color}"> ${range}</span></p><br/>`
    };

    return {
        alert,
        priceline,
        tag
    }
}