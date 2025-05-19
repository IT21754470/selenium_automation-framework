import { WebDriver, By, until } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NavbarLowerMainTests {
  async checkLowerNavbar(driver: WebDriver): Promise<TestResult> {
    try {
      // Wait for the lower navbar to be present
      const lowerNavbar = await driver.wait(
        until.elementLocated(By.css('.lower-navbar')),
        10000,
        'Lower navbar not found'
      );

      // Check if the lower navbar is visible
      const isDisplayed = await lowerNavbar.isDisplayed();
      if (!isDisplayed) {
        return { passed: false, errorMessage: 'Lower navbar is not visible' };
      }

      // Check for main categories
      const categories = ['Beauty & Wellness','Events & Spaces','Health & Medical','Education & Experts'];
      for (const category of categories) {
        const categoryElement = await driver.findElement(By.xpath(`//div[contains(@class, 'lower-navbar')]//a[text()='${category}']`));
        const isDisplayed = await categoryElement.isDisplayed();
        const isEnabled = await categoryElement.isEnabled();

        if (!isDisplayed || !isEnabled) {
          return { passed: false, errorMessage: `Category '${category}' is not visible or clickable` };
        }

        // Click on the category and check if it navigates correctly
        await categoryElement.click();
        const currentUrl = await driver.getCurrentUrl();
        if (!currentUrl.toLowerCase().includes(category.toLowerCase())) {
          return { passed: false, errorMessage: `Clicking on '${category}' did not navigate to the correct page` };
        }

        // Navigate back to the home page
        await driver.navigate().back();
        await driver.sleep(1000); // Wait for the page to load
      }

      return { passed: true };
    } catch (error) {
      return { passed: false, errorMessage: `Error checking lower navbar: ${(error as Error).message}` };
    }
  }
}

