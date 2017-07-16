////////////////////////////////////////////////////////////////////////////////
/**
 * @name AlertSubmit
 * @namespace Factory
 * @desc Factory for AlertSubmit
 */
import alertSubmitModal from './alert_submit_modal.html';
import AlertSubmitController from './alert_submit_controller';

const md = require("markdown").markdown;
module.exports = angular
    .module('tickertags-alert')
    .factory('AlertSubmit', factory);

factory.$inject = [
    'api',
    '$location',
    '$q',
    '$state', 
    '$uibModal',
    'ApiFactory',
    'TickersFactory',
    'Util',
    'Websocket'];

function factory(
    api,
    $location,
    $q,
    $state,
    $uibModal,
    ApiFactory,
    TickersFactory,
    Util,
    Websocket) {
    
    ////////////////////////////////////////////////////////////////////////////
    const notEmpty = Util.notEmpty;
    const uniques  = Util.uniques;
    const returnTickers = R.prop('tickers');

    const findTickers = (tags) => R.map(returnTickers, tags);

    const getTickers = R.compose(R.flatten, findTickers);

    const makeObjects = (tickers) => R.map(TickersFactory.objectifyTicker, tickers);

    const processTickers = (tags, ticker) => makeObjects(R.uniq(getTickers(tags)));

    const startInsightProcess = (tags = [], ticker) => R.not(R.isEmpty(tags)) ? processTickers(tags, ticker) : [];

    const createMainArticle = (mainLink) => { return { title: 'main', url: mainLink }; };

    const formatNote = (alert) => {
        alert.note = md.toHTML(alert.note);
        return alert;
    };

    const returnTickerTicker = R.prop('ticker');

    const mapCheckedTickers = (tickers) => R.map(returnTickerTicker, tickers);

    const addFirstTicker = (checkedTickers) => {
        // checkedTickers.unshift(TickersFactory.getTicker('justName'));
        checkedTickers.unshift($state.params.ticker);
        return checkedTickers;
    };

    const mapCheckedThenUnshift = R.compose(addFirstTicker, mapCheckedTickers);

    const returnCleanedTickers = R.compose(uniques, mapCheckedThenUnshift);

    const registerTickers = (tickers) => {
        const isChecked = (ticker) => ticker.checked;
        const checkedTickers = R.filter(isChecked, tickers);
        return returnCleanedTickers(checkedTickers);
    };

    const getId = (tag) => parseInt(tag.term_id);

    const getTagId = (tags) => R.map(getId, tags);

    const getTagNames = (termIds) => {
        const promises = R.map(ApiFactory.getTagDataSlim, termIds);
        return $q.all(promises).then((tags) => tags);
    };

    const checkFormErrors = (alert, ticker, tags) => {
        const result = { error: false, message: '' };

        if (alert.title === '') {
            result.error = true;
            result.message = 'Please fill out the title';
        }
        else if (R.isEmpty(tags)) {
            result.error = true;
            result.message = 'Please select at least 1 tag';
        }
        else if (ticker === 'SPY') {
            result.error = true;
            result.message = 'You cannot submit Alerts for SPY';
        }
        else {
            result.error = false;
        }

        return result;
    };

    const hasInsightId = R.has('insight_id');

    const statusPassed = (res) => {
        if (res.status) {
            return res.status === 200 || res.status === 'ok';
        } else if (hasInsightId(res)) {
            return true;
        } else {
            return false;
        }
    };

    const addMainLink = (alert, links) => {
        alert.link = links;
        return alert;
    };

    const formatAlert = (alert) => {
        const mainLink = alert.mainLink ? createMainArticle(alert.mainLink) : [];
        if (alert.note) alert = formatNote(alert);
        notEmpty(mainLink) ? alert = addMainLink(alert, [mainLink]) : alert.link = [];
        return alert;
    };

    const isAlertMomentum = (alert) => alert.type === 'momentum' ? 1 : 0;

    const adjustForInsight = (postData, stateParams) => {
        if (stateParams.term_id_1) postData.term_id_1 = stateParams.term_id_1;
        if (stateParams.term_id_2) postData.term_id_2 = stateParams.term_id_2;
        if (stateParams.term_id_3) postData.term_id_3 = stateParams.term_id_3;
        return postData;
    };

    const adjustForAlert = (postData, alert) => {
        const alertPostData = R.clone(postData);
        alertPostData.terms = alert.terms;
        alertPostData.momentum = isAlertMomentum(alert);
        return alertPostData;
    };

    const generatePostData = (formattedAlert) => {
        const startUpdated = Number($state.params.start_epoch) + Util.getRandomNumber(1, 10);

        const post_data = {
            alert_type: formattedAlert.type, // Type of Alert
            title: formattedAlert.title, // Headline
            note: formattedAlert.note, // Description
            link: formattedAlert.link, // Links array, 1st link is always the main article
            tickers: formattedAlert.tickers, // Associated Tickers
            start_epoch: startUpdated,
            end_epoch: Number($state.params.end_epoch),
            sort: $state.params.sort,
            url: $location.$$url,
            pdf: formattedAlert.pdf
        };

        const finalPostData = Util.isInsight(formattedAlert) ? adjustForInsight(post_data, $state.params) : adjustForAlert(post_data, formattedAlert);
        return { type: formattedAlert.type, data: finalPostData };
    };

    const apiInsightSubmit = (post_data) => ApiFactory.insightSubmit(post_data);

    const apiAlertSubmit = (post_data) => ApiFactory.alertSubmit(post_data);

    const post = (finalPost) => {
        Websocket.envCheck(api);
        return Util.isInsight(finalPost) ? apiInsightSubmit(finalPost.data) : apiAlertSubmit(finalPost.data);
    };

    const submit = R.compose(post, generatePostData, formatAlert);

    const postAlert = (alert) => submit(alert).then((res) => statusPassed(res) ? $q.all(res) : res.statusText);

    const requestTagNames = (alert) => getTagNames(alert.termIds);

    const postInsight = (alert) => {
        return requestTagNames(alert).then((tags) => {
            if (tags.length === 3) {
                alert.term_name_1 = tags[0].term;
                alert.term_name_2 = tags[1].term;
                alert.term_name_3 = tags[2].term;
            }
            else if (tags.length === 2) {
                alert.term_name_1 = tags[0].term;
                alert.term_name_2 = tags[1].term;
            }
            else if (tags.length === 1) {
                alert.term_name_1 = tags[0].term;
            }

            return postAlert(alert);
        });
    };

    // http://stackoverflow.com/questions/23923882/upload-pdf-as-base64-file-to-the-server-using-ajax
    const readPDF = (insight_id, pdf_file) => {
        const reader = new FileReader();

        reader.onload = function() {
            const data = reader.result;
            const base64 = data.replace(/^[^,]*,/, '');
            const info = {
                insight_id: insight_id,
                pdf: base64
            };
            return ApiFactory.insightPDF(info);
        };

        return Promise.resolve(reader.readAsDataURL(pdf_file.files[0]));
    };


    const isChecked = (ticker) => ticker.checked;

    const send = (alert) => {
        alert.termsIds = alert.terms;
        alert.tickers = R.filter(isChecked, alert.tickers).map(R.prop('ticker'));
        return Util.isInsight(alert) ? postInsight(alert) : postAlert(alert);
    };

    const display = (ticker) => {
        return $uibModal
            .open({
                template: alertSubmitModal,
                controller: AlertSubmitController,
                controllerAs: 'asub',
                bindToController: true,
                windowClass: 'dash-modal',
                resolve: {ticker: () => ticker, tags: (TagsContainer) => TagsContainer.get()}
            });
    };


    return {
        send,
        statusPassed,
        startInsightProcess,
        addMainLink,
        formatNote,
        createMainArticle,
        getTagId,
        registerTickers,
        getTagNames,
        checkFormErrors,
        submit,
        readPDF,
        display
    }
}