module.exports = angular
    .module('tickertags-shared')
    .factory('CookiesFactory', Cookies);

Cookies.$inject = [
    '$cookies',
    '$httpParamSerializer',
    '$state',
    '$rootScope',
    'TagsContainer',
    'Util'];

function Cookies(
    $cookies,
    $httpParamSerializer,
    $state,
    $rootScope,
    TagsContainer,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const shareUrl = () => {
        console.log('shareUrl...');
        // const base = 'https://www.tickertags.com/dashboard/#/';
        // const base = 'http://localhost:8080/app/#!/dashboard?';
        const base = 'http://localhost/static/dashboard/app/#!/';
        const cookie = $cookies.get('tickertags');
        // console.log('state vars', $httpParamSerializer(JSON.parse(cookie)));
        const parsedState = $httpParamSerializer(JSON.parse(cookie));
        return `${base}${parsedState}`;
    };

    const addTagsToCookie = (stateParams, terms) => {
        switch(terms.length) {
            case 1:
                return { ticker: stateParams.ticker, term_id_1: terms[0] }
                break;
            case 2:
                return { ticker: stateParams.ticker, term_id_1: terms[0], term_id_2: terms[1] }
                break;
            case 3:
                return { ticker: stateParams.ticker, term_id_1: terms[0], term_id_2: terms[1], term_id_3: terms[2] }
                break;
        }
    };

    const refreshCheck = () => {
        const stateCookie = $cookies.get('tickertags');
        if (stateCookie) {
            const cookie = JSON.parse(stateCookie);
            const stateObject = R.filter(Util.notUndefined, cookie);
            const ticker = cookie.ticker    ? cookie.ticker    : null;
            const term_1 = cookie.term_id_1 ? cookie.term_id_1 : null;
            // console.log(' REFRESH stateObject', stateObject);

    	    if (ticker && !term_1) {
    	        $state.go('container.dashboard.tickers.tags', stateObject);
    	    }
            else if (term_1) {
                // console.log('stateObject', stateObject);
                TagsContainer.recreateTerms(stateObject).then(() => {
                    // $state.go('container.dashboard.tickers', { ticker: ticker }).then(() => {
                        $state.go('container.dashboard.tickers.tags', stateObject).then(() => {
                            $state.go('container.dashboard.tickers.tags.activity', stateObject);
                            $rootScope.$emit('viewHeader.displayTags', TagsContainer.getTags());
                        });
                    });
                // });
            }
        }
    };

	////////////////////////////////////////////////////////////////////////////
    return {
        shareUrl,
        addTagsToCookie,
        refreshCheck
    };
}