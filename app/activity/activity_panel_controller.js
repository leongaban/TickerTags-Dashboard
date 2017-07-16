export default function ActivityPanelController($state) {
    this.$onInit = () => this.chart_max = $state.params.chart_max;
}