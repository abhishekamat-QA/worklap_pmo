export class LoginPage {

    constructor(page) {
        this.page = page;

        this.email = page.getByPlaceholder('Email');
        this.password = page.getByPlaceholder('Password');
        this.loginBtn = page.getByRole('button', { name: 'Login' });
        this.signupLink = page.getByRole('link', { name: 'Sign up here' });
    }

    async goto() {
        await this.page.goto('https://wlqa.testingmonkey.com');
    }

    async login(email, password) {
        await this.email.fill(email);
        await this.password.fill(password);
        await Promise.all([
            this.page.waitForURL(/dashboard|hrms\/dashboard/, { timeout: 30000 }),
            this.loginBtn.click()
        ]);
    }
     async openSignup() { 
        await this.signupLink.click(); 
    }

}

