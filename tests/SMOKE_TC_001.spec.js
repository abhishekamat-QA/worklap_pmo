import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { getSignupUsers } from '../utils/jsonReader';
import {generateUniqueSignupUser,generateFallbackUser} from '../utils/testDataGenerator';
import { saveRuntimeUser } from '../utils/jsonWriter';


const signupUsers = getSignupUsers();


test.describe('Signup Flow', () => {

  for (const baseUser of signupUsers) {

    test(`Signup and Organisation Setup - ${baseUser.email}`,async ({ page }) => {
// STEP 1 - Generate unique user data for signup
        const loginPage = new LoginPage(page);
        const signupPage = new SignupPage(page);

        let successfulUser = null;

        const userData = generateUniqueSignupUser(baseUser);

        console.log(`Primary signup user: ${userData.email}`);

// STEP 2 - Open Signup
        await loginPage.goto();

        await expect(loginPage.signupLink).toBeVisible();

        await loginPage.openSignup();

// STEP 3 - Validate Signup Form
        await expect(signupPage.firstNameInput).toBeVisible();

// STEP 4 - Attempt Primary Signup
        console.log(`Attempting signup with: ${userData.email}`);

        await signupPage.fillSignupForm(userData);

        await signupPage.submit();

// STEP 5 - Check Organisation Setup
        const organisationPageLoaded =await isOrganisationSetupPage(page);


        if (organisationPageLoaded) {

          console.log(`*** Signup successful: ${userData.email} ***`);

          successfulUser = userData;

        } else {
// STEP 6 - Primary Signup Failed
          console.log(` Signup failed for: ${userData.email}`);


          // Generate completely new fallback user
          const fallbackUser =generateFallbackUser(baseUser);

          console.log(`Retrying signup with fallback user: ${fallbackUser.email}`);


          // Return to signup page
          await page.reload();

          await expect(signupPage.firstNameInput).toBeVisible();

// STEP 7 - Fallback Signup
          await signupPage.fillSignupForm(fallbackUser);

          await signupPage.submit();

          const fallbackOrganisationPageLoaded =await isOrganisationSetupPage(page);

          expect(fallbackOrganisationPageLoaded,`Signup failed for both ${userData.email} and ${fallbackUser.email}`).toBeTruthy();

          console.log(`*** Signup successful with fallback user: ${fallbackUser.email} ***`);


          successfulUser = fallbackUser;
        }
// SAFETY CHECK

        expect(successfulUser,'No successful signup user was created').not.toBeNull();

        await expect(page).toHaveURL('https://wlqa.testingmonkey.com/organization-account-setup');

        await signupPage.setupOrganisation(successfulUser.companyName);
        console.log(`Company name entered successfully: ${successfulUser.companyName}`);

        await expect(page).toHaveURL('https://wlqa.testingmonkey.com/verify-otp');
        await signupPage.fillOTP();

        await expect(signupPage.verifyBtn).toBeEnabled({timeout: 10000});
        await signupPage.verifyOTP();
        console.log('OTP verification submitted');
        await expect(page).toHaveURL(/dashboard/,{timeout: 15000});
        console.log('*** Dashboard loaded successfully ***');

        saveRuntimeUser({
          ...successfulUser,status: 'SUCCESS',timestamp: new Date().toISOString()
        });

        console.log(`Successful user saved: ${successfulUser.email}`);
        console.log('COMPLETE SIGNUP FLOW PASSED');
      }
    );
  }
});

async function isOrganisationSetupPage(page) {

  try {

    await page.getByRole('textbox', {
      name: 'Company Name'
    }).waitFor({
      state: 'visible',
      timeout: 10000
    });

    return true;

  } catch {

    return false;
  }
}