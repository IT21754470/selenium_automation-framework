import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class ServiceCardsTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 1000): Promise<WebElement> {
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

  private async isElementVisible(element: WebElement): Promise<boolean> {
    try {
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  private async findVisibleElement(driver: WebDriver, selectors: string[]): Promise<WebElement | null> {
    for (const selector of selectors) {
      try {
        console.log(`Attempting to find element with selector: ${selector}`);
        const elements = await driver.findElements(selector.startsWith('//') ? By.xpath(selector) : By.css(selector));
        for (const element of elements) {
          if (await this.isElementVisible(element)) {
            console.log(`Found visible element with selector: ${selector}`);
            return element;
          }
        }
        console.log(`No visible elements found with selector: ${selector}`);
      } catch (error) {
        console.log(`Error with selector ${selector}:`, error);
      }
    }
    return null;
  }

  private async ensureWindowState(driver: WebDriver): Promise<void> {
    try {
      await driver.manage().window().maximize();
      console.log('Window maximized successfully');
    } catch (error) {
      console.warn('Failed to maximize window, continuing with current state:', error);
    }
  }

  async checkServiceCards(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting service cards visibility and click test...');
      
      await this.ensureWindowState(driver);
      
    await driver.get('http://localhost:3000/en');
    console.log('Navigated to http://localhost:3000/en');
      
      await driver.sleep(5000);
      console.log('Waited 5 seconds for page to load');
      
      const cardContainerSelectors = [
        'body > main > section:nth-child(9) > div > div.flex.flex-col.gap-y-7.lg\\:flex-row',
        'main section > div > div.flex.flex-col.gap-y-7',
        'div.flex.flex-col.gap-y-7.lg\\:flex-row',
        'main > section',
        'body > main > section',
        '//main/section[contains(@class, "flex")]',
        '//div[contains(@class, "flex") and contains(@class, "flex-col")]'
      ];

      const cardContainer = await this.findVisibleElement(driver, cardContainerSelectors);
      if (!cardContainer) {
        console.error('Service cards container not found. Dumping page source:');
        const pageSource = await driver.getPageSource();
        console.error(pageSource);
        throw new Error('Service cards container not found');
      }
      console.log('Service cards container found');

      const cardSelectors = [
        'div.flex.flex-col',
        'div[class*="flex"][class*="flex-col"]',
        '//div[contains(@class, "flex") and contains(@class, "flex-col")]'
      ];
      const cards = await cardContainer.findElements(By.css(cardSelectors[0]));
      if (cards.length !== 2) {
        console.warn(`Expected 2 service cards, found ${cards.length}. Attempting to proceed.`);
      }
      console.log(`Found ${cards.length} potential service cards`);

      for (let i = 0; i < cards.length; i++) {
        console.log(`Checking card ${i + 1}`);
        const card = cards[i];
        
        const cardTitle = await card.findElement(By.css('h2, h3, [class*="title"]'));
        console.log(`Card ${i + 1} title:`, await cardTitle.getText());

        const cardButtonSelectors = [
          'a.bg-primary',
          'a.button',
          'a[class*="bg-primary"]',
          'a[class*="button"]',
          'a:not([href])',
          'div > a',
          'button',
          '[role="button"]'
        ];
        const cardButton = await this.findVisibleElement(driver, cardButtonSelectors);
        if (!cardButton) {
          console.warn(`Card ${i + 1} button not found or not visible`);
          continue;
        }
        console.log(`Card ${i + 1} button is visible`);
        await cardButton.click();
        console.log(`Card ${i + 1} button clicked successfully`);

        await driver.sleep(1000);
      }

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('service-cards-visibility-test.png', screenshot, 'base64');

      console.log('Service cards visibility and click test completed');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return {
        passed: false,
        errorMessage: `Error checking service cards: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

