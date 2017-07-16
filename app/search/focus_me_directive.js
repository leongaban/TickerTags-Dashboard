////////////////////////////////////////////////////////////////////////////////
/**
 * @name focusMe
 * @namespace Directives
 * @desc Immediately puts user cursor into desired input field
 */

module.exports = angular.module('tickertags-search')

    // Add Ticker search focus:
    .directive('focusAddTicker', ['$timeout', '$parse', function($timeout, $parse) {
        return {
            scope: { trigger: '=focusAddTicker' },
            link: function(scope, element, attrs) {
                // const model = $parse(attrs.focusAddTicker);
                scope.$watch('trigger', function(value) {
                    if (value === true) {
                        $timeout(() => { element[0].focus(); });
                    }
                });
            }
        }
    }])

    .directive('focusAddTag', ['$timeout', '$parse', function($timeout, $parse) {
        return {
            scope: { trigger: '=focusAddTag' },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    if (value === true) {
                        $timeout(() => { element[0].focus(); });
                    }
                });
            }
        }
    }]);