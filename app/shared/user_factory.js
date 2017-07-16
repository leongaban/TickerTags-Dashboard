////////////////////////////////////////////////////////////////////////////////
/**
 * @name UserFactory
 * @namespace Factories
 * @desc Service to store user settings
 */

module.exports = angular
    .module('tickertags-shared')
    .factory('UserFactory', factory);

factory.$inject = [
    '$state',
    'ApiFactory',
    'FeedSettingsFactory',
    'Settings',
    'Session'];

function factory(
    $state,
    ApiFactory,
    FeedSettingsFactory,
    Settings,
    Session) {

    ////////////////////////////////////////////////////////////////////////////
    const defaultUserObject = {
        user: {},
        settings: {},
        alert_settings: {},
        permissions: []
    };

    let userObject = defaultUserObject;

    let password_reset = false;
    
    const retrieve = () => {
        return ApiFactory.retrieveUserSettings().then((data) => {
            userObject.settings       = data.settings;
            userObject.permissions    = data.permissions;
            userObject.alert_settings = data.alert_settings;
            FeedSettingsFactory.set(userObject.alert_settings);
            return userObject;
        });
    };

    const settings = (user) => {
        if (Session.check(Settings.get().current)) {
            return ApiFactory.retrieveUserSettings(user).then(data => {
                if (!data) throw new Error('data is null');
                Settings.create(data);
                return data;
            }).catch(error => {
                console.warn(`Error fetching settings`);
                $state.go('login', {});
            })
        }
        else {
            return Promise.resolve(Settings.get().current)
        }
    };

    const defaultSettings = (settings) => {
        if (settings.feed_panel === undefined) {
            settings.feed_panel = true;
        }

        if (settings.include_links === null) {
            settings.include_links = true;
        }

        if (settings.include_retweets === null) {
            settings.include_retweets = true;
        }

        if (settings.social_current === '') {
            settings.social_current = 'twitter';
        }

        if (settings.tag_filter === '') {
            settings.tag_filter = 'trend';
        }

        if (settings.twitter_graph === '') {
            settings.twitter_graph = 'frequency';
        }

        return settings;
    };

    const getUserObject = () => userObject;

    const setUserPasswordreset = (bool) => password_reset = bool;

    const getUserPasswordreset = () => password_reset;

    const storeUser = (usr) => {
        userObject.user = usr;
        return userObject;
    };

    const clearUser = () => userObject = {};

    const get = () => userObject;

    ////////////////////////////////////////////////////////////////////////////
    return {
        // Variables
        userObject,
        password_reset,
        // Functions
        clearUser,
        settings,
        storeUser,
        getUserObject,
        setUserPasswordreset,
        getUserPasswordreset,
        retrieve,
        get
    }
}