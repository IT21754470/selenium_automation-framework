import { WebDriver, By, until } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class LogoTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkMainText(): Promise<TestResult> {
    try {
      // Wait for the body to be present and page to load
      await this.driver.wait(until.elementLocated(By.tagName('body')), 10000);

      // Get all text content from the page
      const pageText = await this.driver.executeScript(() => document.body.textContent) as string;

      if (!pageText) {
        return { passed: false, errorMessage: 'Could not retrieve page text content' };
      }

      // Define the text we're looking for
      const requiredTexts = [
        'ONE',
        'STOP',
        'BOOKING',
        'Sri Lanka NO.1 ultimate booking solution'
      ];

      // Check if all required texts are present
      const missingTexts = requiredTexts.filter(text => 
        !pageText.includes(text)
      );

      if (missingTexts.length > 0) {
        return {
          passed: false,
          errorMessage: `The following text is missing from the page: ${missingTexts.join(', ')}`
        };
      }

      // Take a screenshot for verification
      const screenshot = await this.driver.takeScreenshot();
      require('fs').writeFileSync('body-text-verification.png', screenshot, 'base64');

      // Log success message
      console.log('All required text found on page:', requiredTexts);
      
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking page text: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }

  private async isTextVisible(driver: WebDriver, text: string): Promise<boolean> {
    const pageText = await driver.executeScript(() => document.body.textContent) as string | null;
    return pageText ? pageText.includes(text) : false;
  }
}

