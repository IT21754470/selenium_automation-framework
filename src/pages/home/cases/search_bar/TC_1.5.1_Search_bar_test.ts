import { WebDriver, By, until, WebElement, error } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class SearchBarTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 10000): Promise<WebElement> {
    return driver.wait(async () => {
      try {
        const element = await driver.findElement(locator);
        if (await element.isDisplayed()) {
          return element;
        }
      } catch (err) {
        if (!(err instanceof error.NoSuchElementError) && !(err instanceof error.StaleElementReferenceError)) {
          throw err;
        }
      }
      throw new Error(`Element not found: ${locator}`);
    }, timeout, `Timed out after ${timeout} ms waiting for element to be located and visible`);
  }

  private async retryingAction<T>(action: () => Promise<T>, maxAttempts: number = 3): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (err) {
        lastError = err;
        if (!(err instanceof error.StaleElementReferenceError)) {
          throw err;
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }
    throw lastError;
  }

  async checkSearchBar(driver: WebDriver): Promise<TestResult> {
    try {
      const searchBarSelector = 'input[placeholder="Saloon, Spa, Massage, etc"]';

      // Wait for the search bar to be present and visible
      const searchBar = await this.waitForElement(driver, By.css(searchBarSelector));

      // Check if the search bar is enabled
      const isEnabled = await this.retryingAction(() => searchBar.isEnabled());
      if (!isEnabled) {
        return { passed: false, errorMessage: 'Search bar input is not enabled' };
      }

      // Check placeholder text
      const placeholderText = await this.retryingAction(() => searchBar.getAttribute('placeholder'));
      if (placeholderText !== 'Saloon, Spa, Massage, etc') {
        return { passed: false, errorMessage: 'Search bar placeholder text is incorrect' };
      }

      // Check name attribute
      const nameAttribute = await this.retryingAction(() => searchBar.getAttribute('name'));
      if (nameAttribute !== 'query') {
        return { passed: false, errorMessage: 'Search bar input name attribute is incorrect' };
      }

      // Try to input text into the search bar
      await this.retryingAction(async () => {
        await searchBar.clear();
        await searchBar.sendKeys('Massage');
      });
      await driver.sleep(1000); // Wait for any potential JS updates
      const inputValue = await this.retryingAction(() => searchBar.getAttribute('value'));
      if (inputValue !== 'Massage') {
        return { passed: false, errorMessage: 'Unable to input text into the search bar' };
      }

      // Clear the search bar
      await this.retryingAction(() => searchBar.clear());
      await driver.sleep(3000); // Wait for any potential JS updates
      const clearedValue = await this.retryingAction(() => searchBar.getAttribute('value'));
      if (clearedValue !== '') {
        return { passed: false, errorMessage: 'Unable to clear the search bar' };
      }

      // Check if the search bar is part of a form
      const form = await this.waitForElement(driver, By.xpath(`//input[@placeholder="Saloon, Spa, Massage, etc"]/ancestor::form`));
      if (!form) {
        return { passed: false, errorMessage: 'Search bar is not part of a form' };
      }

      // Take a screenshot for verification
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('search-bar-test.png', screenshot, 'base64');

      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking search bar: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }
}

