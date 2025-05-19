import { WebDriver, By, until, WebElement, error } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class SearchBarTest2 {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 20000): Promise<WebElement> {
    console.log(`Waiting for element with locator: ${locator}`);
    try {
      const element = await driver.wait(until.elementLocated(locator), timeout);
      await driver.wait(until.elementIsVisible(element), timeout);
      console.log(`Element found and visible with locator: ${locator}`);
      return element;
    } catch (err) {
      console.error(`Error while waiting for element with locator ${locator}:`, err);
      throw err;
    }
  }

  private async retryingAction<T>(action: () => Promise<T>, maxAttempts: number = 3): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }
    throw lastError;
  }

  async checkSearchBar(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting search bar check...');
      await driver.sleep(10000); // Increased initial wait time
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 60000, 'Page did not finish loading');

      const searchBarLocators = [
        By.css('input[placeholder*="Saloon, Spa, Massage"]'),
        By.css('body > main > section.flex.w-full.items-center.justify-center.sticky.z-\\[150\\].md\\:top-\\[150px\\].xl\\:top-\\[207px\\] > div > div > div > form > div:nth-child(3) > input'),
        By.xpath('//input[@placeholder[contains(., "Saloon, Spa, Massage")]]'),
        By.css('input[type="search"]'),
        By.css('input.search-input'),
        By.css('input[name="query"]')
      ];

      let searchBar: WebElement | null = null;
      for (const locator of searchBarLocators) {
        try {
          searchBar = await this.waitForElement(driver, locator);
          console.log(`Search bar found using locator: ${locator}`);
          break;
        } catch (err) {
          console.log(`Failed to find search bar with locator: ${locator}`);
        }
      }

      if (!searchBar) {
        return { passed: false, errorMessage: 'Search bar not found with any of the provided locators' };
      }

      // Log search bar properties
      const tagName = await searchBar.getTagName();
      const type = await searchBar.getAttribute('type');
      const name = await searchBar.getAttribute('name');
      const placeholder = await searchBar.getAttribute('placeholder');
      console.log(`Search bar properties: tagName=${tagName}, type=${type}, name=${name}, placeholder=${placeholder}`);

      // Check if the search bar is enabled
      const isEnabled = await this.retryingAction(() => searchBar!.isEnabled());
      if (!isEnabled) {
        return { passed: false, errorMessage: 'Search bar input is not enabled' };
      }

      // Try to input text into the search bar
      await driver.executeScript("arguments[0].scrollIntoView(true);", searchBar);
      await driver.sleep(1000);

      await this.retryingAction(async () => {
        await searchBar!.clear();
        await searchBar!.sendKeys('Massage');
      });
      await driver.sleep(2000); // Wait for any potential JS updates
      const inputValue = await this.retryingAction(() => searchBar!.getAttribute('value'));
      console.log(`Input value after entering 'Massage': ${inputValue}`);
      if (inputValue !== 'Massage') {
        // If the value is not exactly 'Massage', check if it contains 'Massage'
        if (inputValue.includes('Massage')) {
          console.log('Search bar contains "Massage" but has additional text');
          return { passed: true, errorMessage: `Search bar contains "Massage" but has additional text: "${inputValue}"` };
        } else {
          return { passed: false, errorMessage: `Unable to input "Massage" into the search bar. Current value: "${inputValue}"` };
        }
      }

      // Clear the search bar
      await this.retryingAction(() => searchBar!.clear());
      await driver.sleep(3000); // Wait for any potential JS updates
      const clearedValue = await this.retryingAction(() => searchBar!.getAttribute('value'));
      console.log(`Cleared value: '${clearedValue}'`);
      if (clearedValue !== '') {
        return { passed: false, errorMessage: `Unable to clear the search bar. Value remains: '${clearedValue}'` };
      }

      // Take a screenshot for verification
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('search-bar-test.png', screenshot, 'base64');

      console.log('Search bar check completed successfully');
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

