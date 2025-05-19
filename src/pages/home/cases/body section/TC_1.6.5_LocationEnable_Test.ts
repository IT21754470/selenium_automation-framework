import { WebDriver, By, until } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

class LocationServiceTest {
  async findElementWithMultipleSelectors(driver: WebDriver, selectors: string[]): Promise<any | null> {
    for (const selector of selectors) {
      try {
        const element = await driver.wait(until.elementLocated(By.css(selector)), 10000);
        return element;
      } catch (error) {
        // Ignore error and try the next selector
      }
    }
    return null;
  }


  async checkLocationServices(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting location services test...');
      
      // Set viewport size
      await driver.manage().window().setRect({ width: 1920, height: 1080 });

      // Navigate to the page (replace with your actual URL)
      await driver.get('http://localhost:3000/en');
      console.log('Navigated to:', await driver.getCurrentUrl());

      // Wait for the page to be interactive
      await driver.wait(until.elementLocated(By.css('body')), 1000, 'Page did not load');

      // Find the location services container
      const containerSelectors = [
        '[data-testid="location-services"]',
        '.location-services-container',
        'main > div > div',
        'body > main > section > div > div.w-full.px-5.md\\:px-7.p-5.md\\:p-10 > div'
      ];

      const container = await this.findElementWithMultipleSelectors(driver, containerSelectors);
      
      if (!container) {
        throw new Error('Location services container not found');
      }

      console.log('Location services container found. Looking for Enable button...');

      // Find and click the Enable button
      const buttonSelectors = ['button', '[role="button"]', 'a.button', 'a[role="button"]'];
      const enableButton = await this.findElementWithMultipleSelectors(driver, buttonSelectors);

      if (!enableButton) {
        throw new Error('Enable button not found');
      }

      console.log('Enable button found. Attempting to click...');

      await enableButton.click();
      console.log('Enable button clicked');

      // Wait for any changes after clicking (you may need to adjust this based on expected behavior)
      await driver.sleep(2000);

      // Take final verification screenshot
      console.log('Taking final verification screenshot...');
      const finalScreenshot = await driver.takeScreenshot();
      fs.writeFileSync('location-services-test-final.png', finalScreenshot, 'base64');

      console.log('Location services test completed successfully.');
      return { passed: true };
    } catch (error) {
      console.error('Test failed with error:', error);
      
      // Take failure screenshot
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('location-services-test-failure.png', failureScreenshot, 'base64');
      } catch (screenshotError) {
        console.error('Failed to take failure screenshot:', screenshotError);
      }

      return {
        passed: false,
        errorMessage: `Error in location services test: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export default LocationServiceTest;
