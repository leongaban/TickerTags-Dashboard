////////////////////////////////////////////////////////////////////////////////
/**
* @name tagsPanel
* @namespace Component
* @desc The Component Controller for the tags tickers_panel
*/
import help from './help/help_modal'

export default function TagsListController(
    container,
    $element,
    $scope,
    $state,
    $stateParams,
    $rootScope,
    $uibModal,
    AddTagFactory,
    ApiFactory,
    Dashboard,
    GetTagsContainer,
    Message,
    MousePosition,
    State,
    TagsContainer,
    TagsFilter,
    TimeSpanFactory,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const tagsList = document.getElementById('tags-panel-list');

    let PARAMS = {
        start: 0,
        limit: null,
        order: null,
        favorite: 0,
        private: 0,
        tag: '', // category
        search: ''
    };

    let TOTAL_TAGS = 0;
    let LIMIT_REACHED = false;

    this.sortTags = (type) => State.go('.tickers.tags.activity', { sort: type });

    this.hoverTag = (tag) => {
        MousePosition.set(event);
        const mouseY = MousePosition.current.y - 20;
        tag.pos = { top: `${mouseY}px` };
        tag.hoverDisplay = true;
    };

    this.leaveTag = (tag) => tag.hoverDisplay = false;

    this.clickTag = (tag) => {
        tag.hoverDisplay = false;
        return TagsContainer.processTag(tag)
    };

    this.openTagsFilter = () => ApiFactory.getCategories(this.ticker).then((categories) => TagsFilter.display(categories));

    this.openAddTagModal = () => AddTagFactory.display(this.ticker);

    this.tagsSearch = _.debounce((value) => {
        if (this.tagSearchInput !== '') this.showCloseSearch = true;
        this.tags = [];
        this.tags_filter = 'all';
        this.category = '';
        PARAMS.tag = '';
        PARAMS.search = value;
        renderTags(this.ticker, PARAMS);
    }, 500);

    this.closeTagSearch = () => {
        this.tagSearchInput = '';
        this.showCloseSearch = false;
        this.tags = [];
        this.tags_filter = 'all';
        this.category = '';
        PARAMS.search = '';
        renderTags(this.ticker, PARAMS);
    };

    this.toggleComingSoon = (type) => Message.failure(`Sort tags by ${type} coming soon.`);

    this.showHelp = () => $uibModal.open(help);

    const setTotal = (tags) => {
        TOTAL_TAGS = tags.total;
        return tags;
    };

    const extractTags = R.prop('array');

    const associateTicker = R.map(tag => {
        return R.assoc('ticker', this.ticker, tag);
    });

    const color = TagsContainer.setTagColors;

    const pushInTags = (tag) => this.tags.push(tag);

    const render = _.curry((isScrolling, tags) => {
        isScrolling ? R.forEach(pushInTags, tags) : this.tags = tags;
        this.tagsEnabled = true;
    });

    const isSpy = (ticker) => ticker === 'SPY';

    const renderTags = (ticker, params=PARAMS, scrolling=false) => {
        this.tagsEnabled = false;
        
        GetTagsContainer
            .getTags(ticker, PARAMS)
            .then(setTotal)
            .then(extractTags)
            .then(associateTicker)
            .then(color)
            .then(render(scrolling));
    };

    const maxlimitCheck = () => this.tags.length >= TOTAL_TAGS;

    const checkScrollLimit = () => {
        if (!LIMIT_REACHED) {
            const scrollingTrue = true;
            PARAMS.start += this.limit;
            maxlimitCheck() ? LIMIT_REACHED = true : renderTags(this.ticker, PARAMS, scrollingTrue);
        }
    };

    const reachedBottom = () => tagsList.scrollHeight - tagsList.scrollTop === tagsList.offsetHeight;

    const scrollingTags = () => {
        if (reachedBottom()) checkScrollLimit();
    };

    this.$onInit = () => {
        tagsList.addEventListener('scroll', scrollingTags);

        this.tags = [];
        this.limit = 30;
        this.onSPY = isSpy($state.params.ticker);
        this.tagSearchInput = '';
        this.tagsEnabled = true;
        this.showCloseSearch = false;
        this.tags_filter = $state.params.tags_filter;
        this.category = TagsFilter.fixSingleCategory($state.params.category);
        this.sort = $state.params.sort;
        this.ticker = Util.encodeTicker($stateParams.ticker);

        PARAMS.start = 0;
        PARAMS.limit = this.limit;
        PARAMS.order = TimeSpanFactory.convertInterval($state.params.timespan, $state.params.sort);
        PARAMS.favorite = $state.params.favorite;
        PARAMS.private = $state.params.private;
        PARAMS.tag = this.tags_filter === 'category' ? $state.params.category : '';
        PARAMS.search = '';

        renderTags(this.ticker, PARAMS);
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on('tagsList.render', (event, ticker) => {
        PARAMS.start = 0;
        renderTags(ticker, PARAMS);
    });
}