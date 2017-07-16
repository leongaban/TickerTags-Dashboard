////////////////////////////////////////////////////////////////////////////////
/**
* @name FeedSettingsFactory
* @namespace Factories
* @desc Stores and retrieves the Feed Alert Settings
*/

module.exports = angular
    .module('tickertags-feed')
    .factory('FeedSettingsFactory', factory);

factory.$inject = [
    'ApiFactory',
    'Settings'];

function factory(
    ApiFactory,
    Settings) {

    ////////////////////////////////////////////////////////////////////////////
    let settings = {
        enabled: true, // <-- notifications
        all_tickers: true,
        tag_insight: true,
        tag_breaking: true,
        tag_momentum: true,
        event_breaking: true,
        cash_breaking: true,
        cash_momentum: true,
        tag_sentiment: true,
        cash_sentiment: true,
        email_summary: true,
        email_realtime: false,
        sms_notification: false,
        sms_number: null
    };

    ////////////////////////////////////////////////////////////////////////////
    const set = (alertSettings) => {
        settings = alertSettings;
        Settings.set('alert_settings', settings);
        return settings;
    };

    const setScope = (bool) => settings.all_tickers = bool;

    const get = () => settings;

    const setEmail = (type, bool) => settings[type] = bool;

    const setSMS = (bool) => settings.sms_notification = !!bool;

    const setSMSnumber = (smsNumber) => settings.sms_number = smsNumber;

    const save = () => {
        console.log('Save alert settings', settings);
        return ApiFactory.postAlertSettings(settings).then(console.log);
    }

    return {
        // Variables
        settings,
        // Functions
        set,
        setScope,
        setEmail,
        setSMS,
        setSMSnumber,
        get,
        save
    };
}