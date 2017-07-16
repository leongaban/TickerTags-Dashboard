////////////////////////////////////////////////////////////////////////////////
/**
* @name TagsContainer
* @namespace Factories
* @desc Functions related to Tags
*/
module.exports = angular
    .module('tickertags-tags')
    .factory('TagsContainer', factory);

factory.$inject = [
    '$q',
    '$state',
    '$rootScope',
    'ApiFactory',
    'ChartFactory',
    'Format',
    'Message',
    'State',
    'Volume'];

function factory(
    $q,
    $state,
    $rootScope,
    ApiFactory,
    ChartFactory,
    Format,
    Message,
    State,
    Volume) {

    ////////////////////////////////////////////////////////////////////////////
    const isMillion = Format.isMillion;
    const places = Format.places;
    const tagSort = { type: 'trend' };
    let VOLUME_TYPE = 'incidences';
    let CONTAINER = [];

    const Term = {
        write(terms) {
            const possible_terms = ['term_id_1', 'term_id_2', 'term_id_3'];
            const defaults = { term_id_1: null, term_id_2: null, term_id_3: null };
            const validIds = R.zipObj(possible_terms, terms);
            return R.merge(defaults, validIds);
        }
    };

    const createTermParams = (termIds) => Term.write(termIds);

    const warning = (tag, from) => {
        from === 'add_tag'
            ? Message.failure(`You have added a new tag named "${tag.term}". However you can only monitor 3 tags at a time. In order to chart your new tag, deselect a currently selected tag then search and select "${tag.term}"`)
            : Message.failure(`Cannot add ${tag.term}. Only 3 tags can be monitored at a time`);
    };

    const save = () => {
        const termIds = R.map(R.prop('term_id'), CONTAINER);

        // return State.go('.tickers.tags.activity', {}).then(() => {
        return State.go('.tickers.tags.activity', Term.write(termIds)).then(() => {
            $rootScope.$emit('viewHeader.displayTags', CONTAINER);
            return Promise.resolve(CONTAINER);
        });
    };

    const remove = (tag) => {
         R.prop('border1', tag) ? delete tag.border1 : null;
         R.prop('border2', tag) ? delete tag.border2 : null;
         R.prop('border3', tag) ? delete tag.border3 : null;

        CONTAINER = R.reject(R.propEq('term_id', tag.term_id), CONTAINER);
        CONTAINER
            .map((tag) => {
            if (tag.border1) delete tag.border1;
            if (tag.border2) delete tag.border2;
            if (tag.border3) delete tag.border3;
        })
        .map((tag, i) => CONTAINER[i]['border'+(i+1)] = true);

        const termIds = R.map(R.prop('term_id'), CONTAINER);

        return State.go('.tickers.tags.activity', Term.write(termIds)).then(() => {
            $rootScope.$emit('viewHeader.displayTags', CONTAINER);
            return Promise.resolve(CONTAINER);
        });
    };

    const saveTag = (tag, from) => {
        if (CONTAINER.length === 3) return Promise.resolve(warning(tag, from));
        tag.selected = true;

        switch(CONTAINER.length) {
            case 0: tag.border1 = true; break;
            case 1: tag.border2 = true; break;
            case 2: tag.border3 = true; break;
        }

        // CONTAINER.push(tag);
        CONTAINER.push(R.clone(tag));
        return save();
    };

    const removeTag = (tag) => {
        tag.selected = false;
        return remove(tag, CONTAINER);
    };

    const processTag = (tag, from = null) => {
        const found = R.find(R.eqProps('term_id', tag), CONTAINER);
        return R.isNil(found) ? saveTag(tag, from) : removeTag(tag);
    };

    const getTags = (type = null) => type === 'term_ids' ? R.map(R.prop('term_id'), CONTAINER) : CONTAINER;

    const rebuildContainer = (terms) => {
        const promises = R.map(ApiFactory.getTagDataSlim, terms);
        return $q.all(promises).then((tags) => {
            CONTAINER = tags;
            return CONTAINER;
        });
    };

    const addedMsg  = (tag) => Message.success(`${tag.term} added from Favorites!`);
    const removeMsg = (tag) => Message.success(`${tag.term} removed from Favorites`);
    const success   = (status) => status && status.toLowerCase() === 'success';
    const errorMsg  = () => Message.success(`There was a problem, please try again later`);

    const addFavorite = (tag) => {
        return ApiFactory.postFavList(tag.term_id).then((status) => success(status) ? Promise.resolve(addedMsg(tag)) : Promise.resolve(errorMsg()));
    };

    const removeFavorite = (tag) => {
        return ApiFactory.deleteFavList(tag.term_id).then((status) => success(status) ? Promise.resolve(removeMsg(tag)) : Promise.resolve(errorMsg()));
    };

    const firehoseOFFSET = Format.firehoseOFFSET;

    // http://tinyurl.com/setTagBoder
    const setBorder = (tagsList) => {
        const termIds = R.map(R.prop('term_id'), CONTAINER);
        return R.map((tag) => {
            const index = R.indexOf(tag.id, termIds);
            return (index > -1) ? R.assoc('border' + (index + 1), true, tag) : tag;
        }, tagsList);
    };

    const setTagColors = (tags) => CONTAINER.length > 0 ? setBorder(tags) : tags;

    const recreateTerms = (stateObject) => {
        const terms = [];
        if (stateObject.term_id_1) terms.push(Number(stateObject.term_id_1));
        if (stateObject.term_id_2) terms.push(Number(stateObject.term_id_2));
        if (stateObject.term_id_3) terms.push(Number(stateObject.term_id_3));
        return rebuildContainer(terms);
    };

    const clearContainer = () => {
        CONTAINER = [];
        return CONTAINER;
    };

    const addCustomTag = (term, ticker, category, visibility) => {
        return ApiFactory.addCustomTag(ticker, term, category, visibility).then((res) => res.data.ticker_tag);
    };

    const tagKeys = R.curry((period, tag) => {
        // http://ramdajs.com/docs/#cond
        const prefix = R.cond([
            [R.equals('3month'), R.always('three_month')],
            [R.equals('2year'), R.always('two_year')],
            [R.equals('max'), R.always('two_year')],
            [R.T, R.always(period)]
        ]);

        const quantity = firehoseOFFSET(R.prop(`${prefix(period)}_quantity`, tag));
        const percentChange = R.prop(`${prefix(period)}_percent_change`, tag);
        const direction = R.equals(percentChange, 0) ? 'stagnant' : R.gt(percentChange, 0) ? 'positive' : 'negative';
        const addQuantityPercentChange = R.compose(
            R.assoc('direction', direction),
            R.assoc('tweet_percentage', Math.round(percentChange)),
            R.assoc('quantity', places(quantity)),
            R.assoc('isMillion', isMillion(quantity))
        );

        return addQuantityPercentChange(tag);
    });

    const updateTagKeys = (type = '', tags, period = 'day') => {
        if (!tags) return [];
        const update = tagKeys(period);
        return tags.map(update);
    };

    const getContainerCount = () => CONTAINER.length;

    const areTermIDsSame = (termID1, termID2) => R.equals(parseInt(termID1), parseInt(termID2));

    const setVolType = (type) => VOLUME_TYPE = type;

    const getVolType = () => VOLUME_TYPE;

    const volume = (tag) => {
        return { incidences: tag['incidences'], mentions: tag['mentions'] };
    };

    const getDateRangeParams = () => {
        const start = $state.params.start_epoch;
        const end   = $state.params.end_epoch;
        const group = Format.groupStartEnd(start, end);
        return { start, end, group };
    };

    const retrieveVolData = (tags, commonParams, streamType = ChartFactory.getDataType(), isSentiment) => {
        const statefulParams = commonParams ? commonParams :  _.set(getDateRangeParams(), 'order', 'asc');
        const volumeInformation = (tag) => new Volume.Tag(tag.term, tag.term_id, statefulParams, streamType, isSentiment);
        return $q.all(R.map(volumeInformation, tags)).then((tagsVolData) => tagsVolData).catch((error) => !console.log(error) && error);
    };

    const favoriteCheck = (searched, favorites) => {
        const updateTags = R.when(R.pipe(R.eqProps('ticker'), R.any(R.__, favorites)), R.assoc('favorites', true));
        return R.map(updateTags, searched);
    };

    // Filters out deleted tags
    const safeContainer = R.reject(R.isNil);

    const get = (terms) => {
        if (terms) {
            const currentContainer = new Set(CONTAINER.map(R.prop('term_id')));
            const rebuild = terms
                .filter(term => term !== null)
                .map((term, index) => {
                    return currentContainer.has(term) ? Promise.resolve(CONTAINER[index]) : ApiFactory.getTagDataSlim(term);
                });
            return $q.all(rebuild).then((container) => {
                CONTAINER = safeContainer(container);
                return CONTAINER;
            });
        }
        return Promise.resolve(safeContainer(CONTAINER));
    };

    const createStateParams = (stateParams) => {
        const termIds = R.map(R.prop('term_id'), CONTAINER);
        const tagParams = createTermParams(termIds);
        return R.merge(stateParams, tagParams);
    };

    ////////////////////////////////////////////////////////////////////////////
    return {
        CONTAINER,
        get,
        createStateParams,
        createTermParams,
        removeTag,
        processTag,
        save,
        getTags,
        rebuildContainer,
        setBorder,
        setTagColors,
        addFavorite,
        removeFavorite,
        recreateTerms,
        clearContainer,
        remove,
        setVolType,
        getVolType,
        volume,
        retrieveVolData,
        addCustomTag,
        updateTagKeys,
        getContainerCount,
        firehoseOFFSET,
        tagKeys,
        favoriteCheck,
        // TESTING
        areTermIDsSame
    }
}