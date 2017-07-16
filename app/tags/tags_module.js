////////////////////////////////////////////////////////////////////////////////
/**
* @name tickertags-tags
* @namespace The module for the Alert Feed
* @desc Encapsulates the Tags related modules
    - tagsConstants
    - addTagController
    - addTagFactory
    - getTagsContainer
    - tagsPanelComponent
    - tagsFactory
    - tagHoverComponent
    - tagsFilterFactory
*/
import tagList from './tags_panel/tags_list.html';
import TagsListController from './tags_panel/tags_list_controller';

const _tickertags_tags_module = angular.module('tickertags-tags', [])
.config(['$stateProvider', ($stateProvider) => {

    const tagsList = {
        name: 'container.dashboard.tickers.tags',
        template: tagList,
        params: {
            tags_filter: 'all',
            sort: 'trend',
            favorite: 0,
            private: 0,
            category: ''
        },
        controller: TagsListController,
        controllerAs: 'tagp',
        resolve: {
            container: ['TagsContainer', function(TagsContainer) {
                return TagsContainer.get();
            }]
        }
    };

    $stateProvider.state(tagsList);
}]);

require("../constant/tags");
require("./add_tag/add_tag_controller");
require("./add_tag/add_tag_factory");
require("./get_tags_factory");
require("./tags_panel/tags_panel_component");
require("./tags_container");
require("./tag_hover/tag_hover_component");
require("./tags_filter/tags_filter_factory");

module.exports = _tickertags_tags_module;