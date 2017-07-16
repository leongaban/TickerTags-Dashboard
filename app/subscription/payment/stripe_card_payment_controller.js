export default function StripeCardCtrl(
    $state,
    ApiFactory,
    Message,
    stripeToken) {

    console.log(stripeToken)
	////////////////////////////////////////////////////////////////////////////
    const stripe = Stripe(stripeToken);

    const elements = stripe.elements();

    const style = {
        base: {
            // Add your base input styles here. For example:
            fontSize: "16px",
            lineHeight: "24px"
        }
    };

    const stripeTokenHandler = token => {
        return ApiFactory.subscription(token.id).then((success) => {
            if (success) Message.success('Your subscription has been activated! Please login.');
            this.onPayment({});
            $state.go('login', {});
        }).catch((err) => {
            Message.failure(`There was an ${err.statusText}. Please try again later.`);
        });
    };

    const onChange = event => {
        const displayError = document.getElementById("card-errors");
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = "";
        }
    };

    const onResult = result => {
        if (result.error) {
            // Inform the user if there was an error
            const errorElement = document.getElementById("card-errors");
            errorElement.textContent = result.error.message;
        } else {
            // Send the token to your server
            stripeTokenHandler(result.token).then(() => this.disableSubmit = false);
        }
    };

    this.submit = () => {
        this.disableSubmit = true;
        stripe.createToken(card).then(onResult).catch(console.error);
    };

    const card = elements.create("card", {style});
    const form = document.getElementById("payment-form");

    this.$onInit = () => {
        card.mount("#card-element");
        card.addEventListener("change", onChange);
        this.disableSubmit = false;
        this.token = null;
    };
}
