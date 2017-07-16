// import { validateEmail } from './shared/utility';

export default function CustomerDetailsController(
    $state,
    ApiFactory,
    Message,
    Util) {

    ////////////////////////////////////////////////////////////////////////////
    const { validateEmail } = Util;
    
    // http://stackoverflow.com/questions/43764025/regex-detect-no-spaces-in-the-string#43764124
    const validPassword = (password) => password.match(/^(?=\D*\d)(?=[^a-zA-Z]*[a-zA-Z])\S{6,}$/);

    const passwordError = 'Passwords must be a minimum of 6 characters, contain at least 1 number and letter and no spaces.';

    const gotoPayment = () => $state.go('subscription.payment');

    const createUser = (creds) => {
        ApiFactory.addUser(creds).then((user) => {
            user ? gotoPayment() : Message.failure('Email already exist');
        });
    };

	const checkPasswords = (creds) => {
        R.equals(creds.password, creds.password2)
            ? validPassword(creds.password)
                ? createUser(creds)
                : Message.failure(passwordError)
            : Message.failure('Passwords must match.');
    };

    const checkNameFields = (creds) => {
        R.isEmpty(creds.firstname)
            ? Message.failure('Please enter your first name.')
            : R.isEmpty(creds.lastname)
                ? Message.failure('Please enter your last name.')
                : checkPasswords(creds);
    };

    this.submitPersonalData = () => {
        const is_email_valid = validateEmail(this.creds.email);
        is_email_valid ? checkNameFields(this.creds) : Message.failure('Please use a valid email.');
    };

    this.toggleInvestorStatus = () => this.formDisabled = !this.indiviual;

	this.$onInit = () => {
        this.formDisabled = true;
        this.indiviual = false;

        this.creds = {
            email: '',
            firstname: '',
            lastname: '',
            password: '',
            password2: '',
        };
    };
}