import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class LocationInputTest {
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
          // Continue to next locator if element not found
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

  async checkLocationInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting location input test...');
      await driver.sleep(5000);
      console.log('Page load wait complete. Searching for location input...');

      const locationInputSelectors = [
        By.css('body > main > section.flex.w-full.items-center.justify-center.sticky.z-\\[150\\].md\\:top-\\[150px\\].xl\\:top-\\[207px\\] > div > div > div > form > div:nth-child(5) > div > input'),
        By.css('input[placeholder*="location"]'),
        By.css('input[aria-label*="location"]'),
        By.css('input[name="location"]'),
        By.css('input.location-input'),
        By.css('[data-testid="location-input"]')
      ];

      const locationInput = await this.waitForElement(driver, locationInputSelectors);
      console.log('Location input found. Attempting to interact with it...');

      await this.retryingAction(async () => {
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", locationInput);
        await driver.sleep(500);
        await locationInput.clear();
        await locationInput.sendKeys('Colombo Sri Lanka');
      });

      await driver.sleep(1000); // Wait for any potential auto-complete or validation

      const inputValue = await this.retryingAction(() => locationInput.getAttribute('value'));
      console.log(`Input value after entering text: ${inputValue}`);

      if (inputValue !== 'Colombo Sri Lanka') {
        return { 
          passed: false, 
          errorMessage: `Input value mismatch: expected="Colombo Sri Lanka", actual="${inputValue}"` 
        };
      }

      // Check if there's any autocomplete dropdown or suggestion list
      try {
        const autocompleteList = await driver.findElements(By.css('ul[role="listbox"], div[role="listbox"]'));
        if (autocompleteList.length > 0) {
          console.log('Autocomplete list found. Selecting the first option...');
          const firstOption = await driver.findElement(By.css('ul[role="listbox"] li:first-child, div[role="listbox"] div:first-child'));
          await firstOption.click();
          await driver.sleep(1000); // Wait for selection to be applied
        }
      } catch (error) {
        console.log('No autocomplete list found or unable to interact with it.');
      }

      // Check the final value after potential autocomplete selection
      const finalValue = await this.retryingAction(() => locationInput.getAttribute('value'));
      console.log(`Final input value: ${finalValue}`);

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
}

