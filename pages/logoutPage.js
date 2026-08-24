export class LogoutPage {
  constructor(page) {
    this.page = page;

    this.profileButton = page.locator("//div[@class='relative']//button[1]");
    this.logoutButton = page.locator('button:has-text("Sign Out")');
  }

  async logout() {
  await this.profileButton.click();
  await this.logoutButton.click();
}
}