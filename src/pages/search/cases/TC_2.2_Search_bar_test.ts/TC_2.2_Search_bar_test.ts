import { WebDriver, By, until, WebElement, error } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class SearchBarTest {
  private async waitForElement(driver: WebDriver, locators: By[], timeout: number = 60000): Promise<WebElement> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const locator of locators) {
        try {
          const element = await driver.wait(until.elementLocated(locator), 1000);
          if (await element.isDisplayed()) {
            console.log(`Element found and visible: ${locator}`);
            return element;
          }
        } catch (err) {
          // Log the error but continue trying
          console.log(`Error finding element with locator ${locator}: ${err}`);
        }
      }
      await driver.sleep(500);
    }
    throw new Error(`Timed out after ${timeout}ms waiting for any of the elements to be located and visible`);
  }

  private async retryingAction<T>(action: () => Promise<T>, maxAttempts: number = 5): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (err) {
        lastError = err;
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw lastError;
  }

  async checkSearchBar(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting search bar test...');
      await driver.sleep(10000); // Increased wait time for page load
      await driver.wait(until.elementLocated(By.css('body')), 30000);
      
      const searchBarSelectors = [
        By.css('input[placeholder*="Search"]'),
        By.css('input[aria-label*="search"]'),
        By.css('input[type="search"]'),
        By.css('input.search-input'),
        By.css('[data-testid="search-input"]'),
        By.xpath("//input[contains(@placeholder, 'Search') or contains(@aria-label, 'search')]")
      ];
      console.log('Searching for search bar...');

      const searchBar = await this.waitForElement(driver, searchBarSelectors);
      console.log('Search bar found. Checking properties...');

      const isEnabled = await this.retryingAction(() => searchBar.isEnabled());
      if (!isEnabled) {
        return { passed: false, errorMessage: 'Search bar input is not enabled' };
      }

      await this.retryingAction(async () => {
        await searchBar.clear();
        await searchBar.sendKeys('Test Search');
      });
      await driver.sleep(1000);
      const inputValue = await this.retryingAction(() => searchBar.getAttribute('value'));
      if (inputValue !== 'Test Search') {
        return { passed: false, errorMessage: `Unable to input text into the search bar. Expected: "Test Search", Got: "${inputValue}"` };
      }

      console.log('Search bar test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking search bar: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }

  async checkLocationInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting location input test...');
      
      const locationInputSelectors = [
        By.css('input[placeholder*="location"]'),
        By.css('input[aria-label*="location"]'),
        By.css('input[name="location"]'),
        By.css('input.location-input'),
        By.css('[data-testid="location-input"]'),
        By.xpath("//input[contains(@placeholder, 'location') or contains(@aria-label, 'location')]")
      ];

      const locationInput = await this.waitForElement(driver, locationInputSelectors);

      await this.retryingAction(async () => {
        await locationInput.clear();
        await locationInput.sendKeys('Test Location');
      });

      const inputValue = await this.retryingAction(() => locationInput.getAttribute('value'));
      if (inputValue !== 'Test Location') {
        return { 
          passed: false, 
          errorMessage: `Input value mismatch: expected="Test Location", actual="${inputValue}"` 
        };
      }

      console.log('Location input test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking location input: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }

  async checkTimeInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting time input test...');
      
      const timeInputSelectors = [
        By.css('input[type="time"]'),
        By.css('input[placeholder*="time"]'),
        By.css('[data-testid="time-input"]'),
        By.css('.time-input'),
        By.css('input[aria-label*="time"]'),
        By.xpath("//input[@type='time' or contains(@placeholder, 'time') or contains(@aria-label, 'time')]")
      ];
      
      const timeInput = await this.waitForElement(driver, timeInputSelectors);

      await this.retryingAction(async () => {
        await timeInput.clear();
        await timeInput.sendKeys('14:30');
      });

      const selectedTime = await timeInput.getAttribute('value');
      console.log(`Selected time: ${selectedTime}`);

      if (selectedTime !== '14:30') {
        throw new Error(`Time selection mismatch. Expected: 14:30, Got: ${selectedTime}`);
      }

      console.log('Time input test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking time input: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

