module.exports = angular.module('tickertags-shared').constant('Websocket', {
    envCheck: function(api) {
    	if (api.websocket.startsWith('wss') && api.termtrend.startsWith('http')) {
            throw new Error(`Do not alerts in production if you are running local, current: ${api.name}`);
        }
    }
});