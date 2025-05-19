import { WebDriver, By, until, WebElement, Key } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class TimeInputTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 60000): Promise<WebElement> {
    console.log(`Waiting for element: ${locator}`);
    try {
      await driver.wait(until.elementLocated(locator), timeout, `Element not found: ${locator}`);
      const element = await driver.findElement(locator);
      await driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
      console.log(`Element found and visible: ${locator}`);
      return element;
    } catch (error) {
      console.error(`Error while waiting for element ${locator}:`, error);
      throw error;
    }
  }

  private async retryClick(driver: WebDriver, element: WebElement, maxAttempts: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await driver.executeScript("arguments[0].click();", element);
        console.log(`Successfully clicked element on attempt ${attempt}`);
        return;
      } catch (error) {
        console.warn(`Click attempt ${attempt} failed:`, error);
        if (attempt === maxAttempts) throw error;
        await driver.sleep(1000);
      }
    }
  }

  async checkTimeInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting time input test...');
      await driver.sleep(5000);
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 30000, 'Page did not finish loading');
      console.log('Page load complete. Searching for time input...');

      const timeInputContainerSelector = By.css('body > main > section.flex.w-full.items-center.justify-center.sticky.z-\\[150\\].md\\:top-\\[150px\\].xl\\:top-\\[207px\\] > div > div > div > form > div.flex.flex-row.gap-x-2.relative.px-4.cursor-pointer.items-center');
      const timeInputContainer = await this.waitForElement(driver, timeInputContainerSelector, 60000);

      console.log('Time input container found. Checking for SVG and text elements...');

      const svgElement = await timeInputContainer.findElement(By.css('svg'));
      console.log('SVG element found in time input container');

      const textElement = await timeInputContainer.findElement(By.css('div > p'));
      console.log('Text element found in time input container');

      const initialText = await textElement.getText();
      console.log(`Initial text in time input: ${initialText}`);

      console.log('Attempting to interact with the time input...');
      await driver.executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", timeInputContainer);
      await driver.sleep(1000);

      await this.retryClick(driver, timeInputContainer);

      // Wait for any potential dropdown or time picker to appear
      await driver.sleep(2000);

      // Check if any new elements appeared after clicking
      const dropdownElements = await driver.findElements(By.css('div[role="listbox"], div[role="dialog"]'));
      if (dropdownElements.length > 0) {
        console.log('Time picker dropdown detected');
        const options = await dropdownElements[0].findElements(By.css('li, button'));
        if (options.length > 0) {
          await this.retryClick(driver, options[Math.floor(options.length / 2)]);
          console.log('Selected a time from the dropdown');
        } else {
          console.warn('No selectable options found in the dropdown');
        }
      } else {
        console.log('No dropdown detected, attempting direct text input');
        await driver.executeScript(`
          var input = arguments[0].querySelector('input[type="time"]') || arguments[0].querySelector('input');
          if (input) {
            input.value = '14:20';
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        `, timeInputContainer);
        await driver.actions().sendKeys(Key.RETURN).perform();
        console.log('Attempted to enter time directly: 14:30');
      }

      // Wait for any updates to take effect
      await driver.sleep(5000);

      // Check if the text has changed
      const updatedText = await textElement.getText();
      console.log(`Updated text in time input: ${updatedText}`);

      if (updatedText === initialText) {
        console.warn('Time input text did not change. Attempting one more interaction...');
        await this.retryClick(driver, timeInputContainer);
        await driver.sleep(2000);
        const finalText = await textElement.getText();
        console.log(`Final text in time input after second attempt: ${finalText}`);
        
        if (finalText === initialText) {
          return { passed: false, errorMessage: 'Time input text did not change after multiple interactions' };
        }
      }

      console.log('Time input test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return {
        passed: false,
        errorMessage: `Error checking time input: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

