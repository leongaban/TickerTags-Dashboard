////////////////////////////////////////////////////////////////////////////////
/**
* @name TagsFilterController
* @namespace Controller
* @desc The Controller for the tags filter modal
*/
export default function TagsFilterController(
    $state,
    categories,
    TagsFilter) {

    ////////////////////////////////////////////////////////////////////////////
    const fixedCategories = TagsFilter.fixCategories(categories);

    const stateGoTags = (type, category) => {
        $state.go('container.dashboard.tickers.tags.activity', TagsFilter.createTagParams(type, category));
        this.$close();
    };

    this.filterBy = (type, cat) => {
        this.allActive = type === 'all';
        this.selectedCategory = cat ? cat.category : '';

        switch(type) {
            case 'all'      : stateGoTags('all'); break;
            case 'category' : stateGoTags('category', this.selectedCategory); break;
            case 'favorite' : stateGoTags('favorite'); break;
            case 'private'  : stateGoTags('private'); break;
        }
    };

    this.cancel = () => this.$close();

    this.$onInit = () => {
        this.allActive        = $state.params.tags_filter === 'all';
        this.favoritesActive  = $state.params.tags_filter === 'favorite';
        this.privateActive    = $state.params.tags_filter === 'private';
        this.selectedCategory = $state.params.category;
        this.categories       = TagsFilter.capitalizeCategories(fixedCategories);
    };
}