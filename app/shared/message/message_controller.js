export default function modalController(msg, success, link) {
    this.msg = msg;
    this.success = success;
    this.link = link;
    this.cancel = () => this.$close();

    this.$onInit = () => {
    	this.linked = R.is(String, this.link);
    };
}