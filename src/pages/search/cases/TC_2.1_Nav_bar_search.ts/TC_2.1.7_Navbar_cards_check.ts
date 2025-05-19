import { WebDriver, By, until, WebElement, error } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class LowerNavbarChecker {
  private async waitForElement(driver: WebDriver, selector: string, timeout: number = 20000): Promise<WebElement> {
    console.log(`Waiting for element with selector: ${selector}`);
    try {
      const element = await driver.wait(until.elementLocated(By.css(selector)), timeout);
      await driver.wait(until.elementIsVisible(element), timeout);
      console.log(`Element found and visible with selector: ${selector}`);
      return element;
    } catch (error) {
      console.error(`Error while waiting for element with selector ${selector}:`, error);
      throw error;
    }
  }

  private async retryingFind(driver: WebDriver, selector: string, maxAttempts: number = 3): Promise<WebElement | null> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.waitForElement(driver, selector);
      } catch (err) {
        if (attempt === maxAttempts) {
          console.error(`Failed to find element after ${maxAttempts} attempts:`, err);
          return null;
        }
        console.log(`Attempt ${attempt} failed, retrying...`);
        await driver.sleep(1000);
      }
    }
    return null;
  }

  async checkLowerNavbar(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting lower navbar check...');
      await driver.sleep(5000); // Wait for page to load
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 30000, 'Page did not finish loading');

      const lowerNavbarSelector = 'body > main > section.w-full.md\\:sticky.md\\:top-\\[80px\\].lg\\:top-\\[81px\\].xl\\:top-\\[80px\\].hidden.md\\:flex.z-\\[150\\].items-center.justify-center.bg-primary.rounded-b-\\[24px\\].md\\:rounded-b-\\[48px\\] > div > div.pr-5.pl-5.sm\\:pl-10.flex.flex-row.items-center.justify-center.w-full.pb-5 > div > div > div';
      console.log(`Searching for lower navbar with selector: ${lowerNavbarSelector}`);

      const lowerNavbar = await this.retryingFind(driver, lowerNavbarSelector);
      if (!lowerNavbar) {
        return { passed: false, errorMessage: 'Lower navbar not found' };
      }

      const isDisplayed = await lowerNavbar.isDisplayed();
      if (!isDisplayed) {
        return { passed: false, errorMessage: 'Lower navbar is not visible' };
      }

      const categorySelectors = [
        'div:nth-child(1)',
        'div:nth-child(2) > div',
        'div:nth-child(3) > div',
        'div:nth-child(4) > div',
        'div:nth-child(5) > div',
        'div:nth-child(6) > div',
        'div:nth-child(7) > div',
        'div:nth-child(8) > div'
      ];

      for (let i = 0; i < categorySelectors.length; i++) {
        const fullSelector = `${lowerNavbarSelector} > ${categorySelectors[i]}`;
        console.log(`Checking category with selector: ${fullSelector}`);
        
        const categoryElement = await this.retryingFind(driver, fullSelector);
        if (!categoryElement) {
          return { passed: false, errorMessage: `Category at index ${i} not found` };
        }

        const isDisplayed = await categoryElement.isDisplayed();
        if (!isDisplayed) {
          return { passed: false, errorMessage: `Category at index ${i} is not visible` };
        }

        const categoryText = await categoryElement.getText();
        console.log(`Category text: ${categoryText}`);
      }

      console.log('Lower navbar check completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking lower navbar: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }
}

