////////////////////////////////////////////////////////////////////////////////
/**
 * @name AddTagController
 * @namespace Controller
 * @desc Controller for the AddTagModal
 */

module.exports = angular
    .module('tickertags-tags')
    .controller('AddTagController', AddTagController)

AddTagController.$inject = [
    'ticker',
    'AddTagFactory',
    'ApiFactory',
    'Format',
    'TagsContainer'
];

function AddTagController(
    ticker,
    AddTagFactory,
    ApiFactory,
    Format,
    TagsContainer) {

    this.gotoHelp = () => { window.open('https://www.tickertags.com/help.html#tag-help', '_blank'); };

    this.closeSimilarTags = () => this.similarTags = false;

    this.tagTyping = () => {
        const word = Format.encodeURI(this.addedTerm);

        if (word.length > 1) {
            this.similarTags = true;
            this.loadSpinner = true;
            ApiFactory.retrieveTagSearchResults(word).then((ticker_tags) => {
                this.tagsList = TagsContainer.updateTagKeys('fuzzy', ticker_tags);
                this.loadSpinner = false;
                this.noResults = this.tagsList.length > 0 ? false : true;
            });
        }
    };

    this.addCustomTag = () => 
        R.isNil(this.addedTerm) ? AddTagFactory.displayError()
                                : AddTagFactory.postCustomTag(this.addedTerm,
                                                              this.ticker,
                                                              this.category.value,
                                                              this.addedVisibility).then((term_id) => {
                                                                console.log('term_id', term_id);
                                                                this.$close();
                                                                return TagsContainer.processTag({
                                                                    term_id: term_id,
                                                                    term: this.addedTerm,
                                                                    tag: this.category.value,
                                                                    ticker: this.ticker
                                                                }, 'add_tag');
                                                            });

    this.cancel = () => this.$close();

    this.$onInit = () => {
        this.focusAddTag = true;
        this.similarTags = false;
        this.categoryOptions = [
            { value: 'Brand' },
            { value: 'Client' },
            { value: 'Cashtag'},
            { value: 'Company Name' },
            { value: 'Competitor Name' },
            { value: 'Government / Regulation' },
            { value: 'Events' },
            { value: 'Industry' },
            { value: 'News' },
            { value: 'People' },
            { value: 'Philanthropic' },
            { value: 'Product' },
            { value: 'Product (Category)' },
            { value: 'Product (Competing)' },
            { value: 'Product (Feature)' },
            { value: 'Place' },
            { value: 'Problem' },
            { value: 'Subsidiary'},
            { value: 'Related Company Name' },
            { value: 'Trend' }
        ];

        this.ticker = ticker;
        this.tagsList = [];
        this.category = this.categoryOptions[9]; // Product
        this.addedVisibility = 'private';
    };
}