import { WebDriver, By, until, WebElement, Key } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class TimeInputTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 30000): Promise<WebElement> {
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

  private async attemptAction(action: () => Promise<void>, maxAttempts: number = 5, delayMs: number = 1000): Promise<void> {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        await action();
        return;
      } catch (err) {
        attempts++;
        console.log(`Attempt ${attempts} failed, retrying in ${delayMs}ms...`);
        if (attempts >= maxAttempts) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
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
      }, 10000, 'Page did not finish loading');
      console.log('Page load complete. Searching for time input...');

      const timeInputSelector = 'body > main > section.w-full.flex.items-center.justify-center.bg-primary.rounded-b-\\[24px\\].md\\:rounded-b-\\[48px\\] > div > div.hidden.lg\\:flex > div > div > form > div.flex.flex-row.gap-x-2.relative.px-4.cursor-pointer.items-center';
      
      const timeInputContainer = await this.waitForElement(driver, By.css(timeInputSelector));
      console.log('Time input container found. Attempting to interact with it...');

      await this.attemptAction(async () => {
        await timeInputContainer.click();
        console.log('Clicked on time input container');
      });

      // Check for time picker or dropdown
      const timePickerSelectors = [
        '.time-picker',
        '.react-time-picker',
        '[role="listbox"]',
        '.time-dropdown'
      ];

      let timePicker: WebElement | null = null;
      for (const selector of timePickerSelectors) {
        try {
          timePicker = await this.waitForElement(driver, By.css(selector), 5000);
          console.log(`Time picker found using selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`Selector ${selector} did not find the time picker.`);
        }
      }

      if (timePicker) {
        // If a time picker is found, try to select a time
        const timeOptions = await timePicker.findElements(By.css('option, li, div[role="option"]'));
        if (timeOptions.length > 0) {
          await this.attemptAction(async () => {
            await timeOptions[Math.floor(timeOptions.length / 2)].click();
            console.log('Selected a time from the time picker');
          });
        } else {
          console.log('No selectable time options found in the time picker');
        }
      } else {
        // If no time picker is found, try to input a time directly
        const timeInputField = await timeInputContainer.findElement(By.css('input'));
        await this.attemptAction(async () => {
          await timeInputField.clear();
          await timeInputField.sendKeys('14:30');
          await timeInputField.sendKeys(Key.RETURN);
          console.log('Entered time directly into the input field');
        });
      }

      // Verify time selection
      const selectedTime = await timeInputContainer.getText();
      console.log(`Selected time: ${selectedTime}`);

      if (!selectedTime) {
        throw new Error('Time selection could not be verified');
      }

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('time-input-test.png', screenshot, 'base64');

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

