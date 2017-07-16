export default function TimespanGranularityComponent(
    $state,
    State,
    TimeConstants,
    TimeSpanFactory) {

    const groupings = TimeConstants.spans;

    this.change = (group) => {
        // $state.go('container.dashboard.tickers.tags.activity', { group });
        State.go('.tickers.tags.activity', { group });
    };

    this.active = (group) => R.equals(this.group, group) ? 'active' : null;

    this.$onInit = () => {
        // grouping: find grouping based on timespan
        const grouping = R.findIndex(R.equals($state.params.timespan), groupings);
        // sliceIndex: if timespan does not exist assumes it is longer than 1 month
        const sliceIndex = R.equals(-1, grouping) ? 3 : grouping;
        // available: take available groupings based on timespan
        const available = R.take(R.add(1, sliceIndex), groupings);
        // Display appropriate granularity group for timespan
        this.groups = TimeSpanFactory.setGranularityGroups($state.params.timespan, available);
        // Set selected granularity active state
        this.default = R.not(R.isNil($state.params.group)) ? $state.params.group : R.takeLast(1, this.groups);
    };
}