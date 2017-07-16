////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-social
* @namespace The SocialMedia module
* @desc Encapsulates the SocialMedia related modules
    - socialMediaComponent
    - socialMediaFactory
    - socialMediaTab
    - socialMediaTabStream
*/
import busy from './social_media/busy.html'
import socialMediaLoading from './social_media/loading/social_media_loading_component.js'


const _tickertags_social_module = angular
    .module('tickertags-social', ['cgBusy'])
    .component('socialMediaLoading', socialMediaLoading)
    .value('cgBusyDefaults', {
    message: 'Loading...',
    template: busy,
});

require('./social_media/social_media_component');
require('./tab/social_media_tab');
require('./social_media_factory');
require('./content/social_tab_stream_component');

module.exports = _tickertags_social_module;