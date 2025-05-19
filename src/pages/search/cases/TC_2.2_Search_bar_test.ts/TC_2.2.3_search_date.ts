import { WebDriver, By, until, WebElement, error, Key } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class DateInputTest {
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

  async checkDateInput(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting date input test...');
      await driver.sleep(1000);
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 10000, 'Page did not finish loading');
      console.log('Page load complete. Searching for date input...');

      const dateInputSelectors = [
        'input[type="date"]',
        'input[placeholder*="date"]',
        'input[aria-label*="date"]',
        '[data-testid="date-input"]',
        '.date-input',
        'input[name*="date"]',
        'div[role="button"][aria-haspopup="dialog"]',
        'button[aria-haspopup="dialog"]',
        'input.bg-transparent',
        'div[class*="datepicker"]',
        'div[class*="date-picker"]'
      ];

      let dateInput: WebElement | null = null;
      for (const selector of dateInputSelectors) {
        try {
          dateInput = await this.waitForElement(driver, By.css(selector));
          console.log(`Date input found using selector: ${selector}`);
          break;
        } catch (error) {
          console.log(`Selector ${selector} did not find the date input.`);
        }
      }

      if (!dateInput) {
        console.log('Attempting to find date input by XPath...');
        const xpathSelectors = [
          "//input[contains(@placeholder, 'date') or contains(@aria-label, 'date')]",
          "//div[contains(@class, 'date') and @role='button']",
          "//button[contains(., 'Select date')]"
        ];
        
        for (const xpath of xpathSelectors) {
          try {
            dateInput = await this.waitForElement(driver, By.xpath(xpath));
            console.log(`Date input found using XPath: ${xpath}`);
            break;
          } catch (error) {
            console.log(`XPath ${xpath} did not find the date input.`);
          }
        }
      }

      if (!dateInput) {
        throw new Error('Could not find the date input element using any of the provided selectors.');
      }

      const isDisplayed = await dateInput.isDisplayed();
      console.log(`Date input is displayed: ${isDisplayed}`);

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('date-input-test.png', screenshot, 'base64');

      return { passed: isDisplayed };
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return {
        passed: false,
        errorMessage: `Error checking date input: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

