export default function ViewSaveLoadController(
	$state,
    Message,
    Util,
    ViewFactory) {

    ////////////////////////////////////////////////////////////////////////////
    const setCurrent = R.head;
    const displaySaveMsg = (name) => Message.display(`You saved a view named: ${name}`, true);
    const displayError = () => Message.display('An error occurred, try again later.', false);

    const processSave = (name) => {
        return ViewFactory.saveView(name).then((status) => {
            status === 'Success' ? displaySaveMsg(name) : displayError();
            return status;
        });
    };

    this.save = (name) => ViewFactory.valid(name)
    	? processSave(name).then(this.close())
    	: displayError('Please name the view you are trying to save');

    this.load = (current) => {
        this.close();
        return ViewFactory.loadView(current);
    };

    this.delete = (views, current) => {
        if (R.isEmpty(views)) return Message.failure('No saved views to delete', false);

        return ViewFactory.viewDelete(current, views).then((status) => {
            if (status === 'success') {
                this.views = R.reject(R.propEq('id', current.id), this.views);
                this.current = setCurrent(this.views);
                return Message.display(`You deleted view: ${current.description}`, true);
            }
            return Message.failure('An error occurred when trying to delete, try again later.');
        });
    };

    this.$onInit = () => {
        this.views = this.resolve.views;
        this.available = Util.notEmpty(this.views);
        this.current = setCurrent(this.views);
        this.feedOpen = R.equals('true', $state.params.feed_open);
    };
}