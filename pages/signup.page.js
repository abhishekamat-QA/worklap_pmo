import { expect } from '@playwright/test';

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

    // Country is a react-select combobox; the placeholder shows "Select Country"
    // when geo-detection hasn't filled it in (happens independently of Timezone,
    // which is usually auto-filled even when Country is not).
    this.countryPlaceholder = page.locator('#react-select-country-select-placeholder');
    this.countryInput = page.locator('#react-select-country-select-input');
    this.countryListbox = page.locator('#react-select-country-select-listbox');

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

  async selectCountry(countryName = 'India') {
    const isUnfilled = await this.countryPlaceholder.isVisible().catch(() => false);

    if (!isUnfilled) {
      console.log('Country already pre-filled, skipping manual selection');
      return;
    }

    await this.countryInput.click();
    await this.countryInput.fill(countryName);

    const option = this.countryListbox.getByRole('option', {name: countryName, exact: true});
    await expect(option).toBeVisible({timeout: 10000});
    await option.click();

    console.log(`Country manually selected: ${countryName}`);
  }

  async setupOrganisation(companyName, country = 'India') {
    await this.page.getByText('Pre-filled from your location').waitFor({state: 'visible', timeout: 15000}).catch(() => {});

    await this.selectCountry(country);

    await expect(async () => {
      await this.companyNameInput.click();
      await this.companyNameInput.fill(companyName);
      await expect(this.companyNameInput).toHaveValue(companyName, {timeout: 2000});
      await this.continueBtn.click();
      await expect(this.companyNameInput).not.toBeVisible({timeout: 3000});
    }).toPass({timeout: 20000});

    console.log(`Company name entered: ${companyName}`);
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