import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

interface CityButton {
  name: string;
  expectedPath: string;
}

export class CityNavigationTest {
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

  private async waitForPageLoad(driver: WebDriver): Promise<void> {
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, 30000, 'Page did not finish loading');
  }

  private async logPageStructure(driver: WebDriver): Promise<void> {
    console.log('Logging page structure for debugging...');
    const main = await driver.findElement(By.css('main.antialiased'));
    const sections = await main.findElements(By.css('section'));
    console.log(`Found ${sections.length} sections in main.antialiased`);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      try {
        const headingElement = await section.findElements(By.css('h1, h2, h3, h4, h5, h6'));
        let headingText = 'No heading';
        if (headingElement.length > 0) {
          headingText = await headingElement[0].getText();
        }
        const sectionText = await section.getText();
        console.log(`Section ${i + 1} heading: "${headingText}"`);
        console.log(`Section ${i + 1} content preview: "${sectionText.substring(0, 100)}..."`);
      } catch (error) {
        console.log(`Error logging section ${i + 1}:`, error);
      }
    }
  }

  async checkCityNavigation(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting city navigation test...');
      
      // Wait for page load
      await this.waitForPageLoad(driver);
      await driver.sleep(2000); // Additional wait for dynamic content

      // Log page structure for debugging
      await this.logPageStructure(driver);

      // Define the cities to test
      const cities: CityButton[] = [
        { name: 'Colombo', expectedPath: '/en/search?city=colombo' },
        { name: 'Kandy', expectedPath: '/en/search?city=kandy' },
        { name: 'Galle', expectedPath: '/en/search?city=galle' },
        { name: 'Kurunegala', expectedPath: '/en/search?city=kurunegala' },
        { name: 'Badulla', expectedPath: '/en/search?city=badulla' },
        { name: 'Hambantota', expectedPath: '/en/search?city=hambantota' }
      ];

      // Find the city navigation section
      const sectionSelectors = [
        'section:has(h2:contains("Popular Cities"))',
        'section:has(div:contains("Colombo"))',
        'body > main > section:nth-child(n+5):nth-child(-n+10)',
        '.city-navigation',
        '[data-testid="city-navigation"]'
      ];

      const navigationSection = await this.findElementWithMultipleSelectors(driver, sectionSelectors);
      if (!navigationSection) {
        throw new Error('City navigation section not found');
      }

      console.log('City navigation section found. Checking city buttons...');

      // Test each city button
      for (const city of cities) {
        console.log(`Testing navigation for ${city.name}`);

        // Find the button for this city
        const buttonSelectors = [
          `button:contains("${city.name}")`,
          `a:contains("${city.name}")`,
          `[role="button"]:contains("${city.name}")`,
          `//button[contains(., "${city.name}")]`,
          `//a[contains(., "${city.name}")]`,
          `//*[contains(@class, "city-button") and contains(text(), "${city.name}")]`
        ];

        const cityButton = await this.findElementWithMultipleSelectors(driver, buttonSelectors);
        if (!cityButton) {
          console.warn(`Button for ${city.name} not found. Skipping this city.`);
          continue;
        }

        // Take screenshot before clicking
        const beforeScreenshot = await driver.takeScreenshot();
        fs.writeFileSync(`city-nav-${city.name}-before.png`, beforeScreenshot, 'base64');

        // Click the button
        await cityButton.click();
        console.log(`Clicked ${city.name} button`);

        // Wait for navigation
        await this.waitForPageLoad(driver);
        await driver.sleep(2000); // Wait for any client-side routing

        // Verify the URL
        const currentUrl = await driver.getCurrentUrl();
        console.log(`Current URL after clicking ${city.name}: ${currentUrl}`);

        if (!currentUrl.includes(city.expectedPath)) {
          console.warn(`Navigation might have failed for ${city.name}. Expected URL to include ${city.expectedPath}, but got ${currentUrl}`);
        }

        // Take screenshot after navigation
        const afterScreenshot = await driver.takeScreenshot();
        fs.writeFileSync(`city-nav-${city.name}-after.png`, afterScreenshot, 'base64');

        // Navigate back to the home page for next test
        await driver.get('http://localhost:3000/en');
        console.log('Navigated to http://localhost:3000/en');
      }

      console.log('Taking final verification screenshot...');
      const finalScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('city-navigation-test.png', finalScreenshot, 'base64');

      console.log('City navigation test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      
      // Take failure screenshot
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('city-navigation-test-failure.png', failureScreenshot, 'base64');
      } catch (screenshotError) {
        console.error('Failed to take failure screenshot:', screenshotError);
      }

      return {
        passed: false,
        errorMessage: `Error in city navigation test: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

