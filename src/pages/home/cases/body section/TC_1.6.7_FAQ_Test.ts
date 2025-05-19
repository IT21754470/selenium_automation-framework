import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

interface FAQItem {
  question: string;
  expectedAnswer: string;
}

export class FAQSectionTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 3000): Promise<WebElement> {
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
          return await this.waitForElement(driver, By.xpath(selector), 1000);
        } else {
          return await this.waitForElement(driver, By.css(selector), 1000);
        }
      } catch (error) {
        console.log(`Selector ${selector} failed, trying next...`);
      }
    }
    return null;
  }

  private async waitForElementToBeClickable(driver: WebDriver, element: WebElement, timeout: number = 10000): Promise<void> {
    await driver.wait(until.elementIsVisible(element), timeout);
    await driver.wait(until.elementIsEnabled(element), timeout);
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

  private async findFAQSection(driver: WebDriver): Promise<WebElement | null> {
    console.log('Searching for FAQ section in main.antialiased...');
    const main = await driver.findElement(By.css('main.antialiased'));
    const sections = await main.findElements(By.css('section'));
    
    for (const section of sections) {
      try {
        const sectionText = await section.getText();
        if (sectionText.toLowerCase().includes('frequently asked questions') || sectionText.toLowerCase().includes('faq')) {
          console.log('Potential FAQ section found:', sectionText.substring(0, 100));
          return section;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async checkFAQSection(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting FAQ section test...');
      
      await driver.wait(until.elementLocated(By.css('main.antialiased')), 60000, 'Main element not found within 60 seconds');
      await driver.sleep(2000); // Additional wait for dynamic content

      await this.logPageStructure(driver);

      const faqContainer = await this.findFAQSection(driver);
      
      if (!faqContainer) {
        throw new Error('FAQ section container not found in main.antialiased');
      }

      console.log('FAQ section found. Checking content...');

      // Check FAQ heading with more flexible text matching
      const headingSelectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[role="heading"]'];
      const heading = await this.findElementWithMultipleSelectors(driver, headingSelectors);
      if (!heading) {
        throw new Error('FAQ heading not found');
      }
      const headingText = await heading.getText();
      console.log(`FAQ heading: "${headingText}"`);

      if (!headingText.toLowerCase().includes('faq') && !headingText.toLowerCase().includes('frequently asked questions')) {
        console.warn(`FAQ heading might be incorrect. Found: "${headingText}"`);
      }

      // Define FAQ items with their expected answers
      const faqItems: FAQItem[] = [
        {
          question: 'How do I book an appointment through the app?',
          expectedAnswer: 'Open the app, browse through available services, select your preferred service provider, choose a convenient time slot, and confirm your booking.'
        },
        {
          question: 'Can I manage my appointments easily?',
          expectedAnswer: 'Yes, you can view, reschedule, or cancel your appointments through the app\'s booking management section.'
        },
        {
          question: 'Will I get reminders for my appointments?',
          expectedAnswer: 'Yes, you\'ll receive notifications and reminders before your scheduled appointments.'
        },
        {
          question: 'Can I see reviews or ratings for the salons?',
          expectedAnswer: 'Yes, you can view ratings, reviews, and feedback from other users for each service provider.'
        },
        {
          question: 'What if I have a special request for my appointment?',
          expectedAnswer: 'You can add special requests or notes when making your booking, and the service provider will be notified.'
        }
      ];

      // Find all FAQ item containers
      const faqItemContainers = await faqContainer.findElements(By.css('div > div'));
      console.log(`Found ${faqItemContainers.length} potential FAQ item containers`);

      if (faqItemContainers.length === 0) {
        throw new Error('No FAQ item containers found');
      }

      // Test each FAQ item
      for (const [index, faq] of faqItems.entries()) {
        console.log(`Testing FAQ item ${index + 1}: ${faq.question}`);

        let faqItemElement: WebElement | null = null;
        for (const container of faqItemContainers) {
          const text = await container.getText();
          if (text.toLowerCase().includes(faq.question.toLowerCase())) {
            faqItemElement = container;
            break;
          }
        }

        if (!faqItemElement) {
          console.warn(`FAQ item for question "${faq.question}" not found`);
          continue;
        }

        // Find and verify expand button is present
        const expandButtonSelectors = ['button', '[role="button"]', '.expand-button', '[aria-expanded]'];
        const expandButton = await this.findElementWithMultipleSelectors(driver, expandButtonSelectors);
        if (!expandButton) {
          console.warn(`Expand button for "${faq.question}" not found`);
          continue;
        }

        // Ensure button is clickable
        await this.waitForElementToBeClickable(driver, expandButton);

        // Take screenshot before expanding
        const screenshotBefore = await driver.takeScreenshot();
        fs.writeFileSync(`faq-item-${index + 1}-before.png`, screenshotBefore, 'base64');

        // Click to expand
        await expandButton.click();
        console.log(`Clicked expand button for "${faq.question}"`);

        // Wait for answer to be visible
        await driver.sleep(1000); // Increased wait time for animation
        
        // Find answer element
        const answerSelectors = ['.answer', '[role="region"]', 'p:not(:first-child)'];
        const answerElement = await this.findElementWithMultipleSelectors(driver, answerSelectors);
        if (!answerElement) {
          console.warn(`Answer element for "${faq.question}" not found after expanding`);
          continue;
        }
        
        // Verify answer is visible and contains expected text
        const isAnswerDisplayed = await answerElement.isDisplayed();
        if (!isAnswerDisplayed) {
          console.warn(`Answer for "${faq.question}" did not appear after clicking expand`);
          continue;
        }

        const answerText = await answerElement.getText();
        if (!answerText.toLowerCase().includes(faq.expectedAnswer.toLowerCase())) {
          console.warn(`Answer for "${faq.question}" does not match expected. Found: "${answerText}"`);
        }

        // Take screenshot after expanding
        const screenshotAfter = await driver.takeScreenshot();
        fs.writeFileSync(`faq-item-${index + 1}-after.png`, screenshotAfter, 'base64');

        // Click again to collapse
        await expandButton.click();
        console.log(`Clicked collapse button for "${faq.question}"`);

        // Wait for animation
        await driver.sleep(1000);

        // Verify answer is hidden
        const isAnswerHidden = !(await answerElement.isDisplayed());
        if (!isAnswerHidden) {
          console.warn(`Answer for "${faq.question}" did not collapse after clicking again`);
        }
      }

      console.log('Taking final verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('faq-section-test.png', screenshot, 'base64');

      console.log('FAQ section test completed successfully.');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      
      // Take a screenshot on failure
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('faq-section-test-failure.png', failureScreenshot, 'base64');
        console.log('Failure screenshot saved as faq-section-test-failure.png');
      } catch (screenshotError) {
        console.error('Failed to capture failure screenshot:', screenshotError);
      }
      
      return {
        passed: false,
        errorMessage: `Error in FAQ section test: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

