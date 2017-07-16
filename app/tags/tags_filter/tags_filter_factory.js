////////////////////////////////////////////////////////////////////////////////
/**
* @name tagsFilter
* @namespace Factory
* @desc Module for the TagsFilter Factory and Controller
*/
import tagsFilterTemplate from './tags_filter.html';
import TagsFilterController from './tags_filter_controller';

module.exports = angular
    .module('tickertags-tags')
    .factory('TagsFilter', factory);

factory.$inject = [
    '$uibModal',
    'Util'];

function factory(
    $uibModal,
    Util) {

    const display = (categories) => {
        $uibModal.open({
            controllerAs: 'tfil',
            bindToController: true,
            template: tagsFilterTemplate,
            windowClass: 'dash-modal',
            resolve: { categories: () => categories },
            controller: TagsFilterController
        });
    };

    const createTagParams = (tags_filter, category) => {
        switch(tags_filter) {
            case 'all'      : return { tags_filter, category: '', favorite: 0, private: 0 }; break;
            case 'favorite' : return { tags_filter, category: '', favorite: 1, private: 0 }; break;
            case 'private'  : return { tags_filter, category: '', favorite: 0, private: 1 };  break;
            case 'category' : return { tags_filter, category }; break;
        }
    };

    const convert = R.compose(R.map(R.zipObj(['category', 'count'])), R.toPairs);

    const badCategoriesList = ['', 'Product', 'unsure', 'tickers'];

    const onlyGoodCategories = R.curry((badCategories, category) => {
        const bad = R.any(R.equals(category.category));
        return R.not(bad(badCategories)) ? category : null;
    });

    const removeBadCategories = (categories) => R.filter(onlyGoodCategories(badCategoriesList), categories);

    const replaceDash = (category) => {
        const noDash = category.category ? category.category.split('-').join(' ') : category.split('-').join(' ');
        category.category ? category.name = noDash : category = { category: noDash, name: noDash };
        return category;
    };

    const replaceDashes = (categories) => R.map(replaceDash, categories);

    const capitalizeName = (category) => {
        const capitalized = category.name ? category.name : category;
        category.name ? category.name = Util.capitalize(capitalized) : category = Util.capitalize(capitalized);
        return category;
    };

    const fixCategories = (categories) => {
        const objectifiedCategories = convert(categories);
        const correctCategories = removeBadCategories(objectifiedCategories);
        return replaceDashes(correctCategories);
    };

    const capitalizeCategories = (categories) => R.map(capitalizeName, categories);

    const categoryKey = (category) => category.category;

    const composeSingleCategory = R.compose(categoryKey, replaceDash, capitalizeName);

    const fixSingleCategory = (category) => composeSingleCategory(category);

    return {
        display,
        createTagParams,
        fixCategories,
        fixSingleCategory,
        capitalizeCategories
    }
}