import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

interface FeatureItem {
  title: string;
  description: string;
}

export class WhyChooseSectionTest {
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

  private async logPageStructure(driver: WebDriver): Promise<void> {
    console.log('Logging page structure for debugging...');
    
    // First log main element structure
    const main = await driver.findElement(By.css('main.antialiased'));
    const sections = await main.findElements(By.css('section'));
    console.log(`Found ${sections.length} sections in main.antialiased`);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      try {
        const html = await section.getAttribute('innerHTML');
        const headingElement = await section.findElements(By.css('h1, h2'));
        let headingText = 'No heading';
        if (headingElement.length > 0) {
          headingText = await headingElement[0].getText();
        }
        console.log(`Section ${i + 1} heading: "${headingText}"`);
        console.log(`Section ${i + 1} first 100 chars: "${html.substring(0, 100)}..."`);
      } catch (error) {
        console.log(`Error logging section ${i + 1}:`, error);
      }
    }
  }

  private async findWhyChooseSection(driver: WebDriver): Promise<WebElement | null> {
    console.log('Searching for Why Choose section in main.antialiased...');
    const main = await driver.findElement(By.css('main.antialiased'));
    const sections = await main.findElements(By.css('section'));
    
    for (const section of sections) {
      try {
        const text = await section.getText();
        if (text.toLowerCase().includes('why choose bookmei')) {
          console.log('Found Why Choose section:', text.substring(0, 100));
          return section;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async checkWhyChooseSection(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting Why Choose section test...');
      
      // Wait for the page to be interactive and main element to be present
      await driver.wait(until.elementLocated(By.css('main.antialiased')), 60000, 'Main element not found within 60 seconds');
      await driver.sleep(2000); // Additional wait for dynamic content

      // Log page structure for debugging
      await this.logPageStructure(driver);

      // Find the Why Choose section container
      let container = await this.findWhyChooseSection(driver);
      
      if (!container) {
        throw new Error('Why Choose section container not found in main.antialiased');
      }

      console.log('Why Choose section container found. Checking content...');

      // Check main heading
      const heading = await container.findElement(By.xpath('.//h2[contains(text(), "Why Choose Bookmei")]'));
      const headingText = await heading.getText();
      const isHeadingDisplayed = await heading.isDisplayed();
      
      console.log(`Main heading: "${headingText}", displayed: ${isHeadingDisplayed}`);
      
      if (!isHeadingDisplayed || !headingText.toLowerCase().includes('why choose bookmei')) {
        throw new Error(`Main heading is not correctly displayed. Text: "${headingText}", Displayed: ${isHeadingDisplayed}`);
      }

      // Check all feature items
      const featureItems: FeatureItem[] = [
        {
          title: 'Convenience at Your Fingertips',
          description: 'Easily search, filter, and find the right service provider near you based on reviews, ratings, prices, and availability.'
        },
        {
          title: 'Seamless Booking Process',
          description: 'Book appointments directly through the app without any hassle. Manage your bookings and receive instant confirmations.'
        },
        {
          title: 'Verified Professionals',
          description: 'All service providers are verified and rated by users, ensuring you get the best service every time.'
        },
        {
          title: '24/7 Availability',
          description: 'Book appointments anytime, anywhere. No need to worry about business hours.'
        }
      ];

      // Find all feature containers within the section
      for (const feature of featureItems) {
        console.log(`Checking feature: ${feature.title}`);
        
        // Look for the feature title
        const featureElement = await container.findElement(
          By.xpath(`.//div[contains(text(), "${feature.title}") or ./*[contains(text(), "${feature.title}")]]`)
        );
        
        if (!featureElement) {
          throw new Error(`Feature title "${feature.title}" not found`);
        }

        // Verify the feature description is present
        const parentDiv = await featureElement.findElement(By.xpath('./..'));
        const text = await parentDiv.getText();
        if (!text.includes(feature.description)) {
          throw new Error(`Description for "${feature.title}" not found or incorrect`);
        }

        // Verify star icon is present
        const starIcon = await parentDiv.findElements(By.css('svg'));
        if (starIcon.length === 0) {
          throw new Error(`Star icon not found for feature "${feature.title}"`);
        }

        console.log(`Feature "${feature.title}" verified successfully`);
      }

      // Check for phone mockup image
      const mockupImage = await container.findElement(By.css('img'));
      const isMockupDisplayed = await mockupImage.isDisplayed();
      if (!isMockupDisplayed) {
        throw new Error('Phone mockup image is not displayed');
      }
      console.log('Phone mockup image is displayed correctly');

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('why-choose-section-test.png', screenshot, 'base64');

      console.log('Why Choose section test completed successfully.');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      
      // Take a screenshot on failure
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('why-choose-section-test-failure.png', failureScreenshot, 'base64');
        console.log('Failure screenshot saved as why-choose-section-test-failure.png');
      } catch (screenshotError) {
        console.error('Failed to capture failure screenshot:', screenshotError);
      }
      
      return {
        passed: false,
        errorMessage: `Error in Why Choose section test: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

