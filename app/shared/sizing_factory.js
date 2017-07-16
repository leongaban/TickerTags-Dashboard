////////////////////////////////////////////////////////////////////////////////
/**
* @name sizingFactory
* @namespace Factory
* @desc Resizings the HighChart and SocialMedia panels
* Will be removed in Angular 2 version of the app (layout and CSS refactor)
*/

module.exports = angular
    .module('tickertags-shared')
    .factory('SizingFactory', factory);

factory.$inject = ['$rootScope'];

function factory($rootScope) {
    const setWidth = (element, minusWidth) => {
        const newWidth = $(window).width() - minusWidth;
        $("#"+element).css('width', newWidth);
        $rootScope.$emit('chart.reflow');
    };

    const windowResize = (element, minusWidth) => $(window).resize(() => setWidth(element, minusWidth));

    const setChartHeight = (element, height) => $("#"+element).height(height);

    const setSize = (element, tagsOpen, feedOpen) => {
        if (element === 'highchart-element') setChartHeight(element, 240);
        // Tags && Feed (Open)
        if (tagsOpen && feedOpen) {
            setWidth(element, 620);
            windowResize(element, 620);
        }
        // Tags (Open) && Feed (Closed)
        else if (tagsOpen && !feedOpen) {
            setWidth(element, 380);
            windowResize(element, 380);
        }
        // Tags (Closed) && Feed (Open)
        else if (!tagsOpen && feedOpen) {
            setWidth(element, 240);
            windowResize(element, 240);
        }
        // Tags and Feed (Closed)
        else if (!tagsOpen && !feedOpen) {
            setWidth(element, 0);
            windowResize(element, 0);
        }
    };

    const setMax = (element) => {
        windowResize(element, 0);
        const winHeight = ($(window).height() - 220);
        setChartHeight(element, winHeight);
    };

    return {
        setSize,
        setMax
    }
}