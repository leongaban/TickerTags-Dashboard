////////////////////////////////////////////////////////////////////////////////
/**
 * @name highChartComponent
 * @desc Component for our custom HighCharts chart
 */
import template from './high_chart.html'

module.exports = angular
    .module('tickertags-chart')
    .component('highChart', {
        template,
        controller: HighChartCtrl,
        controllerAs: 'hc'
    });

HighChartCtrl.$inject = [
    '$rootScope',
    '$state'];

function HighChartCtrl(
    $rootScope,
    $state) {

    ////////////////////////////////////////////////////////////////////////////
    const closeTagsFeed = () => {
        this.tagsOpen = this.feedOpen = false;
    };

    const setChartLoading = (bool) => this.chartLoading = bool;

    this.$onInit = () => {
        this.tagsOpen = $state.params.tags_open;
        this.feedOpen = $state.params.feed_open;
        this.chartMax = $state.params.chart_max;
        this.chartMax ? closeTagsFeed() : null; 
        if (!this.tagsOpen) this.tagsClosed = true;
    };

    // Events //////////////////////////////////////////////////////////////////
    $rootScope.$on('chart.set.loading', (event, bool) => setChartLoading(bool));
}