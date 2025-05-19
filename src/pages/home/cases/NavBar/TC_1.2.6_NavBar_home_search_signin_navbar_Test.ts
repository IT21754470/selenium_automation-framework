import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { expect } from '@jest/globals';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NavbarButtonsTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkNavbarButtons(): Promise<TestResult> {
    try {
      // Wait for the page to be fully loaded
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 60000, 'Timed out waiting for page to load');

      await this.waitForOverlaysToDisappear();

      const buttons = [
        { name: 'Home', selector: "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.items-center.justify-center.gap-x-2 > div.flex.flex-row.items-center.justify-center.gap-x-1 > button:nth-child(1) > span" },
        { name: 'Search', selector: "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.items-center.justify-center.gap-x-2 > div.flex.flex-row.items-center.justify-center.gap-x-1 > button:nth-child(1)" },
        { name: 'Bookings', selector: "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.items-center.justify-center.gap-x-2 > div.flex.flex-row.items-center.justify-center.gap-x-1 > button:nth-child(3)" },
        { name: 'Sign In', selector: "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.items-center.justify-center.gap-x-2 > div.flex.flex-row.items-center.justify-center.gap-x-1 > button:nth-child(4)" }
      ];

      // Add your button checking logic here
      for (const button of buttons) {
        const element = await this.driver.findElement(By.css(button.selector));
        const isDisplayed = await element.isDisplayed();
        if (!isDisplayed) {
          return { passed: false, errorMessage: `${button.name} button is not displayed` };
        }
      }

      return { passed: true };
    } catch (error) {
      return { passed: false, errorMessage: `An unexpected error occurred during testing: ${(error as Error).message}` };
    }
  }

  async waitForOverlaysToDisappear(): Promise<void> {
    const overlaySelectors = ['.overlay', '.loading']; // Add more selectors as needed
    try {
      for (const selector of overlaySelectors) {
        const elements = await this.driver.findElements(By.css(selector));
        if (elements.length > 0) {
          await this.driver.wait(until.elementIsNotVisible(elements[0]), 10000, `Overlay ${selector} is still visible`);
        }
      }
    } catch (error) {
      console.warn(`Warning: Error while waiting for overlays to disappear: ${(error as Error).message}`);
      // We're not failing the test here, just logging a warning
    }
  }
}

