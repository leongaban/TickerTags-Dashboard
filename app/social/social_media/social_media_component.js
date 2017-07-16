////////////////////////////////////////////////////////////////////////////////
/**
* @name SocialMediaComponent
* @namespace Component
* @desc Returns the template for the socialMedia streams
*/
// import template from './social_media.html';
// import SocialMediaController from './social_media_controller';

module.exports = angular
    .module('tickertags-social')
    .component('socialMediaPanel', {
    	template: `<div ui-view="social@activity"></div>`
    });