export default function PortfolioTickerController(
    $q,
    ApiFactory,
    GetTagsContainer,
    Message,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
	let PARAMS = {
        start: 0,
        limit: 3000,
        order: null,
        favorite: 0,
        private: 0,
        tag: '',
        search: ''
    };

    this.tagsListLoaded = false;

    this.toggleAll = (checkAll) => {
        this.ticker.data.all = checkAll;
        this.update();
    };

    this.update = () => {
        if (this.selectedTags.length > 0) {
    	   this.ticker.data.term_id = R.map(R.prop('term_id'), this.selectedTags);
        }
    	this.ticker.data.tags = this.selectedCategories;
    	this.onUpdate({
    		index: this.index,
    		ticker: this.ticker
    	});
    };

	this.keyUp = (event) => event.key === 'Escape' ? this.close() : null;

	this.tagSearch = (value, ticker) => {
        PARAMS.search = value;
        return GetTagsContainer.getTags(Util.encodeTicker(ticker.ticker), PARAMS).then((tags) => {
            this.tagsList = tags.array;
            this.tagsListLoaded = true;
        });
    };

    this.selectTag = (tag) => {
        if (this.selectedTags.length === 10) {
        	Message.failure('You can only add up to 10 tags.');
        }
        else {
	        this.selectedTags.push(tag);
	        this.selectedTags = R.dropRepeats(this.selectedTags);
	        this.update();
        }
    };

    this.removeTag = (tag) => {
    	this.selectedTags = R.reject(R.eqProps('term_id', tag), this.selectedTags);
    	this.update();
    };

    this.removeCategory = (category) => {
    	const s = new Set(this.multipleSelect);
    	s.delete(category);
    	this.multipleSelect = Array.from(s);
    	this.update();
    };

    this.selectCategories = () => {
        this.selectedCategories = this.multipleSelect;
        this.update();
    };

	this.remove = (ticker) => {
		this.onRemove({
			ticker
		});
	};

	this.$onInit = () => {
        this.checkAll = this.ticker.data.all;
		this.multipleSelect = Util.notEmpty(this.ticker.data.tags) ? this.ticker.data.tags : '';
		this.selectedCategories = this.ticker.data.tags;
		this.selectedTags = this.ticker.data.term_id;

		if (this.ticker.data.term_id) {
			const promises = R.map(ApiFactory.getTagDataSlim, this.ticker.data.term_id);
			$q.all(promises).then((tags) => {
				this.selectedTags = tags;
			});
		}
	};
}