////////////////////////////////////////////////////////////////////////////////
/**
* @name badAlertController
* @namespace Controller
* @desc Controls the template for the Alert ThumbsUpModal
*/
export default function AlertDenyController(
    FeedFactory,
    Message,
    UserFactory,
    tag) {

    ////////////////////////////////////////////////////////////////////////////
    const denyValue = -2;

    const resetAndClose = () => {
        this.denyMessage = '';
        this.$close();
    };

    this.submitDenyMsg = () => {
        tag.note = this.denyMessage;
        FeedFactory.submit(tag, denyValue).then((res) => Message.success('Bad alert has been sent to the database!'));
        resetAndClose();
    };

    this.$onInit = () => {
        const userObj = UserFactory.get();
        this.denyMessage = '';
        tag.approved = denyValue;
        tag.admin = userObj.user.username;
    };

    this.cancel = () => this.$close();
}