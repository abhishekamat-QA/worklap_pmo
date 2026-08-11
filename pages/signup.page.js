export class SignupPage {
  constructor(page) {
    this.page = page;

    // Signup
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.emailInput = page.getByPlaceholder('Email');
    this.createPasswordInput = page.getByPlaceholder('Create Password');
    this.confirmPasswordInput = page.getByPlaceholder('Confirm Password');

    this.signupBtn = page.getByRole('button', {name: 'Sign Up',exact: true});

    // Organisation Setup
    this.companyNameInput = page.getByRole('textbox', {name: 'Company Name'});

    this.continueBtn = page.getByRole('button', {name: 'Continue'});

    // OTP
    this.otpInputs = page.getByRole('textbox');

    this.verifyBtn = page.getByRole('button', {name: 'Verify'});

    // Dashboard
    this.welcomeHeading = page.getByRole('heading', {name: '👋 Welcome back,'});
  }

  async fillSignupForm(userData) {
    await this.firstNameInput.fill(userData.firstName);
    await this.lastNameInput.fill(userData.lastName);
    await this.emailInput.fill(userData.email);
    await this.createPasswordInput.fill(userData.password);
    await this.confirmPasswordInput.fill(userData.password);
  }

  async submit() {
    await this.signupBtn.click();
  }

  async signup(userData) {
    await this.fillSignupForm(userData);
    await this.submit();
  }

  async setupOrganisation(companyName) {
    await this.companyNameInput.click();
    await this.companyNameInput.fill(companyName);

    console.log(`Company name entered: ${companyName}`);

    await this.continueBtn.click();
  }

  async fillOTP() {
    await this.otpInputs.first().waitFor({state: 'visible'});

    for (let i = 0; i < 6; i++) {
      await this.otpInputs.nth(i).fill('0');
    }

    console.log('OTP entered: 000000');
  }

  async verifyOTP() {
    await this.verifyBtn.click();
  }
}