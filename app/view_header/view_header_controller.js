export default function ViewHeaderController(
    $element,
    $state,
    $rootScope,
    $uibModal,
    ApiFactory,
    Message,
    State,
    TagsContainer,
    Util,
    ViewFactory) {

	////////////////////////////////////////////////////////////////////////////
    this.hoverTicker = (ticker) => ticker.hoverDisplay = true;

    this.leaveTicker = (ticker) => ticker.hoverDisplay = false;

    this.leaveTag = (tag) => tag.hoverDisplay = false;

    this.hoverTag = (tag) => tag.hoverDisplay = true;

    this.removeTag = (tag) => {
        tag.hoverDisplay = false;
        this.container = [];
        TagsContainer.processTag(tag).then((container) => {
            this.container = container;
            const termIds = R.map(R.prop('term_id'), this.container);
            const params  = TagsContainer.createTermParams(termIds);
            params.ticker = $state.params.ticker;
            this.showClearTags = this.container.length > 0;

            State.go('.tickers.tags.activity', { params }).then(() => {
                $rootScope.$emit('tagsList.render', $state.params.ticker);
            });
        });
    };

    this.clearTags = () => {
        this.container = TagsContainer.clearContainer();
        const social = $state.params.social;
        const stream = $state.params.stream;

        State.go('.tickers.tags.activity', {
                ticker: $state.params.ticker,
                term_id_1: null,
                term_id_2: null,
                term_id_3: null,
                social,
                stream
            }, true).then(() => {
                this.container = TagsContainer.clearContainer();
                $rootScope.$emit('tagsList.render', $state.params.ticker);
            });
    };

    this.share = () => {
        const shareUrl = ViewFactory.createShareUrl($state.params);
        ApiFactory.vanityUrl(shareUrl).then(vanityUrl => {
            Message.display(vanityUrl, true, vanityUrl);
        });
    };

    this.openSaveLoadViews = () => {
        $uibModal.open({
            appendTo: $element,
            component: 'viewSaveLoad',
            resolve: {
                views: ApiFactory.getViews().then(ViewFactory.formatViews)
            }
        });
    };

    const clearButtonCheck = (container) => Util.notEmpty(container);

    const rebuildContainer = (params) => {
        TagsContainer.recreateTerms(params).then((container) => {
            this.container = container;
            this.showClearTags = clearButtonCheck(this.container);
        });
    };

    this.$onInit = () => {
        const term_1 = $state.params.term_id_1;
        this.tickerObj = { ticker: $state.params.ticker };
        this.ticker = $state.params.ticker;
        this.feedOpen = $state.params.feed_open;
        this.chartExpanded = false;
        this.showClearTags = false;

        TagsContainer.get().then((tags) => {
            this.container = tags;

            const emptyContainer = R.isEmpty(this.container);
            const termExists = Util.notUndefined(term_1);
            const containerToRebuild = emptyContainer && termExists;

            containerToRebuild ? rebuildContainer($state.params) : this.showClearTags = clearButtonCheck(this.container);
        });
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on('viewHeader.displayTags', (event, container = []) => {
        this.container = container.length > 0 ? container : TagsContainer.get();
        this.showClearTags = this.container.length > 0;
    });
}
