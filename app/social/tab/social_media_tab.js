////////////////////////////////////////////////////////////////////////////////
/**
* @name socialMediaTab
* @namespace Component
* @desc Controls the markup for the socialMediaTabs
*/
import template from './social_media_tab.html';

module.exports = angular
    .module('tickertags-social')
    .component('socialMediaTab', {
        template,
        controller: SocialMediaTabController,
        controllerAs: 'smt',
        bindings: {
            type: '<',
            active: '<',
            onSelect: '&',
            onFilter: '&',
            onTweetToggle: '&',
            onHide: '&',
            onDomain:'&'
        }
    });

SocialMediaTabController.$inject = [
    '$state',
    'SocialMediaFactory'];

function SocialMediaTabController(
    $state,
    SocialMediaFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const socialFactory = SocialMediaFactory;

    this.$onChanges = (changed) => this.active = changed.type.currentValue.active;

    this.select = (type) => this.onSelect({ type: type });

    this.toggle = (type) => {
        this.filter = true;
        // this.busy = new Promise(function(resolve, reject) { setTimeout(function(){ resolve(true)}, 4000)})
        this.busy = this.onFilter({ type: type });

        this.busy.then((res) => {
            this.domains = res.domains;
            this.total = res.total;
        });
    };

    this.hide = () => {
        this.filter = false;
        this.onHide();
    };

    this.setDomain = (domain) => {
        this.filter = false;
        // this.onDomain({ domain: domain, type: this.tab });
        this.onDomain({ domain: domain });
    };

    this.toggleTwitter = () => {
        socialFactory.storeValues(this.twitter_links, this.twitter_retweet);
        this.onTweetToggle({
            start: $state.params.start_epoch,
            end: $state.params.end_epoch,
            links: this.twitter_links,
            retweets: this.twitter_retweet
        });
    };

    this.$onInit = () => {
        this.tab = this.type.tab;
        this.title = this.type.title;
        this.twitter_links = $state.params.links;
        this.twitter_retweet = $state.params.retweets;
        this.filter = false;
        this.domains = [];
        this.total = 0;
        this.isTweets = this.type.tab === 'tweets';
    };
}