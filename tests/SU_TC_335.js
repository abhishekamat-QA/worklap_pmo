import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { getSignupUsers } from '../utils/jsonReader';
import { generateFallbackUser } from '../utils/testDataGenerator';
import { saveRuntimeUser } from '../utils/jsonWriter';

const signupUsers = getSignupUsers();

test.describe('Signup Flow', () => {

  for (const userData of signupUsers) {

    test(
      `Signup and Organisation Setup - ${userData.email}`,
      async ({ page }) => {

        const loginPage = new LoginPage(page);
        const signupPage = new SignupPage(page);

        await loginPage.goto();
        await expect(loginPage.signupLink).toBeVisible();
        console.log('Signup page opened successfully');

        await loginPage.openSignup();

        await expect(signupPage.firstNameInput).toBeVisible();

        console.log('Signup form is visible');

        console.log(`Attempting signup with: ${userData.email}`);

        await signupPage.fillSignupForm(userData);
        await signupPage.submit();

        const organisationPageLoaded = await isOrganisationSetupPage(page);

        let successfulUser;
        if (organisationPageLoaded) {
          console.log(`*** Signup successful: ${userData.email} ***`);
          successfulUser = userData;
        }

        else {
          console.log(`Signup failed for: ${userData.email}`);
          const fallbackUser = generateFallbackUser();
          console.log(`Retrying signup with fallback user: ${fallbackUser.email}`);

          await page.reload();

          await expect(signupPage.firstNameInput).toBeVisible();

          await signupPage.fillSignupForm(fallbackUser);
          await signupPage.submit();

          const fallbackOrganisationPageLoaded = await isOrganisationSetupPage(page);

          expect(fallbackOrganisationPageLoaded,`Signup failed for both ${userData.email} and ${fallbackUser.email}`).toBeTruthy();

          console.log(`*** Signup successful with fallback user: ${fallbackUser.email} ***`);

          successfulUser = fallbackUser;
        }
        
        await expect(page).toHaveURL('https://wlqa.testingmonkey.com/organization-account-setup');
        console.log('Organisation Setup page loaded successfully');

        await signupPage.setupOrganisation(successfulUser.companyName);

        console.log(`Company name entered successfully: ${successfulUser.companyName}`);

        await expect(page).toHaveURL('https://wlqa.testingmonkey.com/verify-otp');
        console.log('OTP page loaded successfully');

        await signupPage.fillOTP();
        await signupPage.verifyOTP();
        console.log('OTP verification submitted');

        await expect(page).toHaveURL(/dashboard/);
        console.log('*** Dashboard loaded successfully ***');

        saveRuntimeUser(successfulUser);
        console.log(`Successful user saved: ${successfulUser.email}`);
      }
    );
  }
});


async function isOrganisationSetupPage(page) {

  try {
    await page.getByRole('textbox', {name: 'Company Name'}).waitFor({state: 'visible',timeout: 10000});
    return true;
  } catch {
    return false;
  }
}