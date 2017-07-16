////////////////////////////////////////////////////////////////////////////////
/**
 * @name AddTagFactory
 * @namespace Factories
 * @desc Factory for the AddTagModal
 */

import template from './add_tag_modal.html';

module.exports = angular
    .module('tickertags-tags')
    .factory('AddTagFactory', factory);

factory.$inject = [
	'$uibModal',
    'Message',
    'TagsContainer'];

function factory(
	$uibModal,
    Message,
    TagsContainer) {

	const display = (ticker) => {
		const modal = $uibModal.open({
            controller: 'AddTagController',
            controllerAs: 'atg',
            bindToController: true,
            template,
            windowClass: 'dash-modal',
            resolve: {
                ticker: () => ticker
            },
        });
	};

    const displayError = () => Message.display('Please enter a custom tag.', false);

    const displaySavedMsg = (term, visibility) => {
        Message.display(`You have added a ${term} as a ${visibility} tag!`, true);
    };

    const postCustomTag = (term, ticker, category, visibility) => TagsContainer.addCustomTag(term, ticker, category, visibility).then((res) => {
        displaySavedMsg(term, visibility);
        return res.term_id;
    });

	return {
		display,
        displayError,
        postCustomTag
	}
}