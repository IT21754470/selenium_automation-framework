import { WebDriver, By, until, WebElement, error } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class LocationInputTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 20000): Promise<WebElement> {
    await driver.wait(async () => {
      const elements = await driver.findElements(locator);
      return elements.length > 0;
    }, timeout, `Timed out after ${timeout} ms waiting for element to be present`);
    return driver.findElement(locator);
  }

  private async retryingAction<T>(action: () => Promise<T>, maxAttempts: number = 5): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (err) {
        lastError = err;
        if (!(err instanceof error.StaleElementReferenceError) && 
            !(err instanceof error.ElementNotInteractableError)) {
          throw err;
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw lastError;
  }

  async checkLocationInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Waiting for page to load...');
      await driver.sleep(5000);
      await driver.wait(until.elementLocated(By.css('body')), 10000);
      await driver.executeScript('return document.readyState === "complete"');
      console.log('Page load wait complete. Searching for elements...');

      // Updated selector to match the exact path
      const formContainerSelector = 'section[class*="flex"][class*="w-full"][class*="items-center"][class*="justify-center"]';
      const formContainer = await this.waitForElement(driver, By.css(formContainerSelector));

      // Find the specific div containing the input using the full path
      const inputContainerSelector = 'div > div > div > form > div:nth-child(5) > div';
      const inputContainer = await this.retryingAction(async () => 
        formContainer.findElement(By.css(inputContainerSelector))
      );

      // Find the input within the container
      const locationInputSelector = 'input.bg-transparent';
      const locationInput = await this.retryingAction(async () => 
        inputContainer.findElement(By.css(locationInputSelector))
      );

      // Add explicit wait for input to be ready
      await driver.wait(until.elementIsVisible(locationInput), 10000);
      await driver.wait(until.elementIsEnabled(locationInput), 10000);

      // Verify input is enabled and visible
      const isEnabled = await this.retryingAction(() => locationInput.isEnabled());
      const isDisplayed = await this.retryingAction(() => locationInput.isDisplayed());
      
      if (!isEnabled || !isDisplayed) {
        return { 
          passed: false, 
          errorMessage: `Location input is not interactive: enabled=${isEnabled}, displayed=${isDisplayed}` 
        };
      }

      // Test input interaction with explicit waits between actions
      await this.retryingAction(async () => {
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", locationInput);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].focus();", locationInput);
        await driver.sleep(200);
        await locationInput.clear();
        await driver.sleep(200);
        await locationInput.sendKeys('Colombo Sri Lanka');
        await driver.sleep(200);
      });

      // Verify input value after interaction
      const inputValue = await this.retryingAction(() => locationInput.getAttribute('value'));
      if (inputValue !== 'Colombo Sri Lanka') {
        return { 
          passed: false, 
          errorMessage: `Input value mismatch: expected="Colombo Sri Lanka", actual="${inputValue}"` 
        };
      }

      // Take verification screenshot
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('location-input-test.png', screenshot, 'base64');

      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      const pageSource = await driver.getPageSource();
      console.error('Page source:', pageSource);
      return {
        passed: false,
        errorMessage: `Error checking location input: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }
}

