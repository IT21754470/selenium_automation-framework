import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class TrendingServicesTest {
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

  private async findElementWithMultipleSelectors(driver: WebDriver, selectors: string[]): Promise<WebElement | null> {
    for (const selector of selectors) {
      try {
        console.log(`Attempting to find element with selector: ${selector}`);
        if (selector.startsWith('//')) {
          return await this.waitForElement(driver, By.xpath(selector));
        } else {
          return await this.waitForElement(driver, By.css(selector));
        }
      } catch (error) {
        console.log(`Selector ${selector} failed, trying next...`);
      }
    }
    return null;
  }

  async checkTrendingServices(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting trending services test...');
      
      await driver.get('http://localhost:3000/en');
      console.log('Navigated to http://localhost:3000/en');
        
     
      await driver.sleep(1000); // Increased initial wait time
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 30000, 'Page did not finish loading');
      console.log('Page load complete. Searching for trending services container...');

      const selectors = [
        '[data-testid="trending-services"]',
        '.trending-services-container',
        '#main-content .trending-services',
        '//h2[contains(text(), "Trending Services")]/following-sibling::div',
        'body > main > section:nth-child(8) > div > div > div:nth-child(2)' // Original selector as fallback
      ];

      const trendingServicesContainer = await this.findElementWithMultipleSelectors(driver, selectors);

      if (!trendingServicesContainer) {
        throw new Error('Trending services container not found with any of the attempted selectors');
      }

      console.log('Trending services container found. Checking content...');

      // Check if the container is displayed
      const isDisplayed = await trendingServicesContainer.isDisplayed();
      console.log(`Trending services container is displayed: ${isDisplayed}`);

      if (!isDisplayed) {
        throw new Error('Trending services container is not displayed');
      }

      // Check for loading indicator
      try {
        const loadingIndicator = await trendingServicesContainer.findElement(By.css('[role="progressbar"], .loading-indicator, .spinner'));
        console.log('Loading indicator found. Waiting for it to disappear...');
        await driver.wait(until.stalenessOf(loadingIndicator), 30000, 'Loading indicator did not disappear');
      } catch (error) {
        console.log('No loading indicator found. Proceeding with content check.');
      }

      // Check for actual content
      const contentElements = await trendingServicesContainer.findElements(By.css('div, p, span, a'));
      const hasContent = contentElements.length > 0;
      console.log(`Trending services container has content: ${hasContent}`);

      if (!hasContent) {
        throw new Error('No content found in the trending services container');
      }

      // Check for specific content
      const contentChecks = [
        { name: 'Title', selector: 'h2, h3, .title' },
        { name: 'Service items', selector: 'li, .service-item' },
        { name: 'Service links', selector: 'a.service-link' },
      ];

      for (const check of contentChecks) {
        const elements = await trendingServicesContainer.findElements(By.css(check.selector));
        console.log(`${check.name} found: ${elements.length}`);
      }

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('trending-services-test.png', screenshot, 'base64');

      console.log('Trending services test completed successfully.');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      return {
        passed: false,
        errorMessage: `Error checking trending services: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

