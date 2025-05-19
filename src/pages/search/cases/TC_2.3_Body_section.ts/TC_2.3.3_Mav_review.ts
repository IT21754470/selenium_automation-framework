import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class MapTests {
  private async waitForElement(driver: WebDriver, selector: string, timeout: number = 30000): Promise<WebElement | null> {
    try {
      console.log(`Waiting for element: ${selector}`);
      const element = await driver.wait(until.elementLocated(By.css(selector)), timeout);
      await driver.wait(until.elementIsVisible(element), timeout);
      console.log(`Element found: ${selector}`);
      return element;
    } catch (error) {
      console.error(`Error waiting for element ${selector}:`, error);
      return null;
    }
  }

  async checkMapVisibility(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting map visibility check...');
      await driver.sleep(5000); // Wait for page to load
      await driver.wait(async () => {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
      }, 30000, 'Page did not finish loading');

      // Check for the main map container
      const mapContainerSelector = 'div[style*="z-index: 3; position: absolute; height: 100%; width: 100%;"]';
      const mapContainer = await this.waitForElement(driver, mapContainerSelector);

      if (!mapContainer) {
        console.error('Map container not found');
        return { 
          passed: false, 
          errorMessage: 'Map container not found' 
        };
      }

      if (!await mapContainer.isDisplayed()) {
        console.error('Map container is not visible');
        return { 
          passed: false, 
          errorMessage: 'Map container is not visible' 
        };
      }

      console.log('Map is visible');
      return { passed: true };
    } catch (error) {
      console.error('Error in checkMapVisibility:', error);
      return { 
        passed: false, 
        errorMessage: `Error checking map visibility: ${(error as Error).message}` 
      };
    }
  }
}

