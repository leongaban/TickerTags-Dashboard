////////////////////////////////////////////////////////////////////////////////
/**
* @name socialTabStream
* @namespace Component
* @desc Controls the markup for the socialTabStreams
*/
import template from './social_tab_stream.html';

module.exports = angular
    .module('tickertags-social')
    .component('socialTabStream', {
        template,
        controller: SocialTabStream,
        controllerAs: 'sts',
        bindings: {
            api: '='
        }
    });

SocialTabStream.$inject = [
    'SocialMediaFactory',
    'UserFactory'];

function SocialTabStream(
    SocialMediaFactory,
    UserFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const socialFactory = SocialMediaFactory;

    const wireTab = (tabName, streams) => {
        this.tabStream = [];
        this.tabName   = tabName;
        this.tabStream = streams;
        // console.log('this.tabStream', this.tabStream)
    };

    const emptyStream = () => this.tabStream = [];

    const setPermissions = (userObj) => {
        if (R.isEmpty(userObj)) return null;
        this.canHamSpam = userObj.user.isAdmin;
        this.canSetTweetSentiment = userObj.user.isAdmin;
        // this.canHamSpam = _.includes(userObj.permissions, 'spam_ham');
        // this.canSetTweetSentiment = _.includes(userObj.permissions, 'submit_sentiment_label');
    };

    function setStream(stream) {
        wireTab(stream.type, stream.data);
    }

    function clearStream() {
        emptyStream();
    }

    this.$onInit = () => {
        setPermissions(UserFactory.get());
        this.scoreSentiment = socialFactory.scoreSentiment;
        this.thumbs  = socialFactory.thumbVotes;
        this.spamHam = socialFactory.spamStatus;
        this.tabName = 'twitter';
        this.tabStream = [];
        this.api = {};
        this.api.setStream = setStream;
        this.api.clearStream = clearStream;
    };
}