////////////////////////////////////////////////////////////////////////////////
/**
 * @name AlertSubmitController
 * @namespace Controller
 * @desc The Controller AlertSubmitController
 */
export default function AlertSubmitController(
    $scope,
    AlertSubmit,
    ApiFactory,
    Message,
    ticker,
    tags) {

    ////////////////////////////////////////////////////////////////////////////
    const apiError = ApiFactory.apiError;
    
    this.$onInit = () => {
        this.submitting = false;
        this.pdf_attached = false;
        this.confirmation = false;

        this.alert = {
            type     : 'insight',
            title    : '',
            note     : '',
            link     : null,
            ticker   : ticker,
            tags     : tags,
            termIds  : [],
            tickers  : [],
            terms    : [],
            mainLink : null
        };

        const tickerlist = tags.map(R.prop('ticker'));
        const propTickers = R.prop('tickers');
        const justTicker = R.prop('ticker');
        const associatedTickers = tags.filter(propTickers).map(propTickers);
        const reducedtickers = associatedTickers.map(R.map(justTicker)).reduce((tickers, ticker) => [...tickers, ...ticker], []);
        const dedupe = new Set([ticker, ...tickerlist, ...reducedtickers]);

        this.alert.tickers = Array.from(dedupe).map(ticker => ({ticker}));
        // console.log(tags);
        // console.log(this.alert.tickers);
    };

    const defaultAlert = R.clone(this.alert);

    const resetForm = () => this.alert = defaultAlert;

    $scope.fileNameChanged = () => $scope.$emit('pdf.attached');

    const closeModal = (success = true) => {
        if (success) Message.success('Alert successfully submitted!');
        this.submitting = false;
        this.$close();
        resetForm();
    };

    const uploadPDF = (insight_id) => {
        const pdf_file = $('#pdf-file-input')[0];
        this.pdf_attached = false;
        this.$close();
        return AlertSubmit.readPDF(insight_id, pdf_file).then(closeModal());
    };

    const uploadNoPDF = () => closeModal();

    const checkForPDF = (insight_id) => this.pdf_attached ? uploadPDF(insight_id) : uploadNoPDF();

    this.removePDF = () => {
        document.getElementById("pdf-file-input").value = "";
        this.pdf_attached = false;
    };

    const badRequestMsg = (resMsg) => {
        Message.failure(`${resMsg}, did you try to submit the same alert?`);
        return closeModal(false);
    };

    this.submitClicked = () => this.confirmation = true;

    this.cancelSubmit = () => this.confirmation = false;

    this.submitAlertForm = () => {
        this.submitting = true;
        this.alert.terms = AlertSubmit.getTagId(this.alert.tags);
        const result = AlertSubmit.checkFormErrors(this.alert, ticker, tags);
        return result.error ? Message.failure(result.message) : AlertSubmit.send(this.alert).then((res) => {
            if (R.equals(res, 'Bad Request')) return badRequestMsg(res);
            return R.equals(this.alert.type, 'insight') ? checkForPDF(res.insight_id) : closeModal();
        }).catch(apiError);
    };

    this.cancel = () => this.$close();

    // Events //////////////////////////////////////////////////////////////////
    $scope.$on('pdf.attached', (event) => this.pdf_attached = true);
}