import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  testId: string;
  testName: string;
  errorMessage?: string;
}

interface CardElements {
  promotionBadge?: string;
  providerName: string;
  location: string;
  services: Array<{
    name: string;
    duration: string;
    price: string;
  }>;
  rating?: {
    score: number;
    count: number;
  };
}

export class CardTests {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(selector: string, timeout: number = 30000): Promise<WebElement | null> {
    try {
      const locator = selector.startsWith('//') ? By.xpath(selector) : By.css(selector);
      const element = await this.driver.wait(until.elementLocated(locator), timeout);
      await this.driver.wait(until.elementIsVisible(element), timeout);
      return element;
    } catch (error) {
      console.error(`Error waiting for element ${selector}:`, error);
      return null;
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3, delay: number = 2000): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await this.driver.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
    throw new Error('This line should never be reached');
  }

  private async validateCardElement(card: WebElement, selector: string, expectedText?: string): Promise<boolean> {
    try {
      const element = await this.retryOperation(() => card.findElement(By.css(selector)));
      if (!element) {
        console.error(`Element not found: ${selector}`);
        return false;
      }
      if (expectedText) {
        const actualText = await element.getText();
        if (actualText !== expectedText) {
          console.error(`Text mismatch for ${selector}. Expected: ${expectedText}, Got: ${actualText}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error(`Error validating element ${selector}:`, error);
      return false;
    }
  }

  async checkSearchCard(): Promise<TestResult> {
    try {
      console.log('Starting search card check...');
      
      // Wait for the page to load completely
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 60000);
  
      // Locate the search card with retry
      const cardSelector = 'div.w-full.flex.flex-row';
      const card = await this.retryOperation(async () => {
        const foundCard = await this.waitForElement(cardSelector);
        if (!foundCard) throw new Error('Search card not found');
        console.log('Search card found');
        return foundCard;
      });

      if (!card) {
        return { passed: false, testId: 'TC_2.1.1', testName: 'Search Card Presence', errorMessage: 'Search card not found after retries' };
      }

      // Check if card is visible
      if (card && !await card.isDisplayed()) {
        return { passed: false, testId: 'TC_2.1.2', testName: 'Search Card Visibility', errorMessage: 'Search card is not visible' };
      }

      // Validate all card elements
      const validations = await Promise.all([
        this.validateCardElement(card, '.swiper'),
        this.validateCardElement(card, 'div[class*="bg-[#EE0000]"]'),
        this.validateCardElement(card, 'div.absolute.top-3.right-3 svg'),
        this.validateCardElement(card, 'div[class*="bg-black"]'),
        this.validateCardElement(card, 'h3.font-semibold'),
        this.validateCardElement(card, 'div.flex.flex-row.gap-x-1'),
        this.validateCardElement(card, 'div.flex.flex-col.flex-grow'),
        this.validateCardElement(card, 'div[class*="cursor-pointer py-1"]'),
        this.validateCardElement(card, 'a[href^="/about-us/category"]')
      ]);

      // Check services details
      const serviceElements = await card.findElements(By.css('div.w-full.flex.items-center.flex-row.justify-between'));
      for (const serviceElement of serviceElements) {
        const serviceValidations = await Promise.all([
          this.validateCardElement(serviceElement, 'h3.font-medium'),
          this.validateCardElement(serviceElement, 'p.text-\\[\\#525252\\]'),
          this.validateCardElement(serviceElement, 'div.flex.flex-row.gap-x-3.items-center p')
        ]);
        
        if (serviceValidations.includes(false)) {
          return { 
            passed: false, 
            testId: 'TC_2.1.3',
            testName: 'Service Details Validation',
            errorMessage: 'Service details validation failed' 
          };
        }
      }

      // Check if any validation failed
      if (validations.includes(false)) {
        return { 
          passed: false, 
          testId: 'TC_2.1.4',
          testName: 'Card Elements Validation',
          errorMessage: 'Card elements validation failed' 
        };
      }

      // Check More Details link navigation
      const moreDetailsResult = await this.checkMoreDetailsNavigation(card);
      if (!moreDetailsResult.passed) {
        return moreDetailsResult;
      }

      // Log success
      console.log('Search card validation passed');
      return { passed: true, testId: 'TC_2.1', testName: 'Search Card Test' };
    } catch (error) {
      console.error('Error in checkSearchCard:', error);
      return { 
        passed: false, 
        testId: 'TC_2.1',
        testName: 'Search Card Test',
        errorMessage: `Error: ${(error as Error).message}` 
      };
    }
  }

  async checkMoreDetailsNavigation(card: WebElement): Promise<TestResult> {
    try {
      console.log('Checking More Details link navigation...');
      
      const moreDetailsLink = await card.findElement(By.css('a[href^="/about-us/category"]'));
      const href = await moreDetailsLink.getAttribute('href');
      
      // Store the current window handle
      const originalWindow = await this.driver.getWindowHandle();
      
      // Click the More Details link
      await moreDetailsLink.click();
      
      // Wait for the new window or tab
      await this.driver.wait(
        async () => (await this.driver.getAllWindowHandles()).length === 2,
        10000
      );
      
      // Loop through until we find a new window handle
      const windows = await this.driver.getAllWindowHandles();
      for (const handle of windows) {
        if (handle !== originalWindow) {
          await this.driver.switchTo().window(handle);
          break;
        }
      }
      
      // Wait for the new page to load
      await this.driver.wait(async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 10000);
      
      // Check if the current URL matches the expected URL
      const currentUrl = await this.driver.getCurrentUrl();
      const expectedUrl = `http://localhost:3000${href}`;
      
      if (currentUrl !== expectedUrl) {
        console.error(`URL mismatch. Expected: ${expectedUrl}, Got: ${currentUrl}`);
        return {
          passed: false,
          testId: 'TC_2.1.5',
          testName: 'More Details Navigation',
          errorMessage: `More Details link navigation failed. Expected URL: ${expectedUrl}, Actual URL: ${currentUrl}`
        };
      }
      
      console.log('More Details link navigation successful');
      
      // Close the new window and switch back to the original
      await this.driver.close();
      await this.driver.switchTo().window(originalWindow);
      
      return {
        passed: true,
        testId: 'TC_2.1.5',
        testName: 'More Details Navigation'
      };
    } catch (error) {
      console.error('Error in checkMoreDetailsNavigation:', error);
      return {
        passed: false,
        testId: 'TC_2.1.5',
        testName: 'More Details Navigation',
        errorMessage: `Error checking More Details navigation: ${(error as Error).message}`
      };
    }
  }

  async getCardData(card: WebElement): Promise<CardElements | null> {
    try {
      const providerName = await card.findElement(By.css('h3.font-semibold')).getText();
      const location = await card.findElement(By.css('div.flex.flex-row.gap-x-1')).getText();
      
      const services = [];
      const serviceElements = await card.findElements(By.css('div.w-full.flex.items-center.flex-row.justify-between'));
      for (const serviceElement of serviceElements) {
        const name = await serviceElement.findElement(By.css('h3.font-medium')).getText();
        const duration = await serviceElement.findElement(By.css('p.text-\\[\\#525252\\]')).getText();
        const price = await serviceElement.findElement(By.css('div.flex.flex-row.gap-x-3.items-center p')).getText();
        services.push({ name, duration, price });
      }

      let rating;
      try {
        const ratingElement = await card.findElement(By.css('div[class*="cursor-pointer py-1"]'));
        const ratingText = await ratingElement.getText();
        const [score, count] = ratingText.split(' ');
        rating = { score: parseFloat(score), count: parseInt(count.replace(/[()]/g, '')) };
      } catch {
        // Rating is optional
      }

      let promotionBadge;
      try {
        promotionBadge = await card.findElement(By.css('div[class*="bg-[#EE0000]"]')).getText();
      } catch {
        // Promotion badge is optional
      }

      return {
        promotionBadge,
        providerName,
        location,
        services,
        rating
      };
    } catch (error) {
      console.error('Error getting card data:', error);
      return null;
    }
  }
}

export async function runSearchCardTest(driver: WebDriver): Promise<TestResult> {
  const test = new CardTests(driver);
  return await test.checkSearchCard();
}

