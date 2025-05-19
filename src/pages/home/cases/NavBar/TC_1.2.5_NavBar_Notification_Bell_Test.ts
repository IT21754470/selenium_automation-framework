import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NotifyBellTests {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async testNotifyBell(): Promise<TestResult> {
    try {  
      console.log('Navigated to the page');

      // Wait for the page to load completely
      await this.driver.wait(until.elementLocated(By.tagName('body')), 3000);
      console.log('Body element found, page should be loaded');

      const notifyBellSelector = "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.items-center.justify-center.gap-x-2 > div.flex.items-center.justify-center.relative.cursor-pointer";

      let notifyBell: WebElement | null = null;
      try {
        notifyBell = await this.driver.wait(
          until.elementLocated(By.css(notifyBellSelector)),
          20000
        );
        console.log('Found notification bell using the provided selector');
      } catch (error) {
        console.log('Failed to find notification bell with the provided selector');
        return { passed: false, errorMessage: 'Notification Bell Testing Error: Unable to locate notification bell' };
      }

      if (!notifyBell) {
        return { passed: false, errorMessage: 'Notification Bell Testing Error: Unable to locate notification bell' };
      }

      await this.driver.wait(until.elementIsVisible(notifyBell), 10000);
      console.log('Notification bell element is now visible in the DOM');

      const isNotifyBellVisible = await notifyBell.isDisplayed();
      console.log(`Notification bell visibility: ${isNotifyBellVisible}`);

      if (!isNotifyBellVisible) {
        return { passed: false, errorMessage: 'Notification Bell Testing Error: Notification bell not visible' };
      }

      return { passed: true };
    } catch (error) {
      console.error('Unexpected error during notification bell testing:', error);
      return { passed: false, errorMessage: `Notification Bell Testing Error: ${(error as Error).message}` };
    }
  }
}

