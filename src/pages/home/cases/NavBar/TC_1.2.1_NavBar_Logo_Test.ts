import { By, until, WebDriver } from 'selenium-webdriver';
import logger from '../../../../util/logger';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NavbarTests {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkLogo(): Promise<TestResult> {
    try {
      const logoSelectors = [
        '.logo',
        'img[alt="logo"]',
        'header img',
        '#logo',
        '.navbar-logo'
      ];

      for (const selector of logoSelectors) {
        try {
          const logoElement = await this.driver.wait(until.elementLocated(By.css(selector)), 5000);
          if (await logoElement.isDisplayed()) {
            return { passed: true };
          }
        } catch (selectorError) {
          // Continue to next selector
        }
      }

      return { passed: false, errorMessage: 'Unable to locate element .logo' };
    } catch (error) {
      return { passed: false, errorMessage: 'Error during logo test' };
    }
  }
}

