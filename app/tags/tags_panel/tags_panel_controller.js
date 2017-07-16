/**
 * Created by paulo on 4/14/17.
 */
export default function TagsPanelController($stateParams) {
    this.$onInit = () => this.ticker = $stateParams.ticker;
}