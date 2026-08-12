export class LogoutPage {
  constructor(page) {
    this.page = page;

    //this.profileButton = page.locator('button.flex.items-center.space-x-2.hover\\:opacity-80.transition-opacity');
    this.profileButton = page.locator("//div[@class='relative']//button[1]");
    this.logoutButton = page.locator('button:has-text("Sign Out")');
//    this.logoutButton = page.getByText('Sign Out');
//    this.logoutButton = page.locator("//div[@class='relative']//a[normalize-space()='Sign Out']");
  }

  async logout() {
  await this.profileButton.click();

 // await this.page.pause();

  //await expect(this.logoutButton).toBeVisible();

  await this.logoutButton.click();
}
}