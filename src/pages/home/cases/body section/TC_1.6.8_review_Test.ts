import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class ReviewTest {
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
          return await this.waitForElement(driver, By.xpath(selector), 10000);
        } else {
          return await this.waitForElement(driver, By.css(selector), 10000);
        }
      } catch (error) {
        console.log(`Selector ${selector} failed, trying next...`);
      }
    }
    return null;
  }

  private async waitForPageLoad(driver: WebDriver, timeout: number = 30000): Promise<void> {
    await driver.wait(async () => {
      const readyState = await driver.executeScript('return document.readyState');
      return readyState === 'complete';
    }, timeout, 'Page did not finish loading');
  }

  private async waitForSwiperInitialization(driver: WebDriver, timeout: number = 30000): Promise<void> {
    await driver.wait(async () => {
      const swiperInitialized = await driver.executeScript(`
        return document.querySelector('.swiper-initialized') !== null;
      `);
      return swiperInitialized;
    }, timeout, 'Swiper did not initialize');
  }

  async checkReviews(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting reviews test...');
      await driver.sleep(5000); // Increased initial wait time
      await this.waitForPageLoad(driver);
      console.log('Page load complete. Checking review elements...');

      // Check reviews section
      const reviewSectionSelectors = [
        'body > main > section:nth-child(9) > div > div.w-full.flex.flex-col.py-5.md\\:py-10.px-5.sm\\:px-20.lg\\:px-40',
        '.swiper.swiper-initialized.swiper-horizontal',
        '[data-testid="reviews-section"]',
        '//section[contains(.//h2, "Reviews")]',
        'section:has(.swiper)',
        'div:has(> .swiper)'
      ];

      const reviewSection = await this.findElementWithMultipleSelectors(driver, reviewSectionSelectors);
      if (!reviewSection) {
        throw new Error(`Reviews section not found. Tried selectors: ${reviewSectionSelectors.join(', ')}`);
      }
      console.log('Reviews section found');

      // Wait for Swiper initialization
      await this.waitForSwiperInitialization(driver);
      console.log('Swiper initialized');

      // Check Swiper container
      const swiperSelectors = [
        '.swiper-wrapper',
        'div.swiper.swiper-initialized.swiper-horizontal.swiper-backface-hidden',
        '[data-testid="reviews-swiper"]',
        '.swiper'
      ];

      const swiperContainer = await this.findElementWithMultipleSelectors(driver, swiperSelectors);
      if (!swiperContainer) {
        throw new Error(`Swiper container not found. Tried selectors: ${swiperSelectors.join(', ')}`);
      }
      console.log('Swiper container found');

      // Check review cards
      const reviewCardSelectors = [
        '.swiper-slide',
        '.w-full.bg-white.sm\\:w-\\[347px\\].h-\\[257px\\]',
        '[data-testid="review-card"]',
        '.swiper-slide > div'
      ];

      const reviewCards = await driver.findElements(By.css(reviewCardSelectors[0]));
      console.log(`Found ${reviewCards.length} review cards`);

      if (reviewCards.length === 0) {
        throw new Error(`No review cards found. Tried selectors: ${reviewCardSelectors.join(', ')}`);
      }

      // Check individual card elements
      for (let i = 0; i < reviewCards.length; i++) {
        const card = reviewCards[i];
        console.log(`Checking review card ${i + 1}`);

        try {
          // Check rating
          const ratingElement = await card.findElement(By.css('.bg-primary, [data-testid="rating"]'));
          const ratingText = await ratingElement.getText();
          console.log(`Rating found: ${ratingText}`);

          // Check star icons
          const starIcons = await card.findElements(By.css('svg[viewBox="0 0 576 512"], .star-icon'));
          console.log(`Found ${starIcons.length} star icons`);

          // Check review text
          const reviewText = await card.findElement(By.css('p, [data-testid="review-text"]'));
          const text = await reviewText.getText();
          console.log(`Review text found: ${text.substring(0, 50)}...`);

          // Check user profile
          const userImage = await card.findElement(By.css('img[alt="user"], .user-avatar'));
          const userName = await card.findElement(By.css('h3, .user-name'));
          const userLocation = await card.findElement(By.css('p.text-\\[12px\\], .user-location'));

          console.log(`User profile found: ${await userName.getText()} from ${await userLocation.getText()}`);
        } catch (cardError) {
          console.error(`Error checking card ${i + 1}:`, cardError);
        }
      }

      // Check navigation arrows
      const navigationSelectors = [
        '.swiper-button-prev, .swiper-button-next',
        '[data-testid="swiper-prev"], [data-testid="swiper-next"]',
        '//button[contains(@class, "swiper-button")]',
        '.swiper-navigation button'
      ];

      const navigationButtons = await driver.findElements(By.css(navigationSelectors[0]));
      if (navigationButtons.length !== 2) {
        console.warn(`Expected 2 navigation buttons, found ${navigationButtons.length}`);
      }

      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('review-test.png', screenshot, 'base64');

      console.log('Review test completed successfully.');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }

      // Take a screenshot on failure
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('review-test-failure.png', failureScreenshot, 'base64');
        console.log('Failure screenshot saved as review-test-failure.png');
      } catch (screenshotError) {
        console.error('Failed to capture failure screenshot:', screenshotError);
      }

      return {
        passed: false,
        errorMessage: `Error checking reviews: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

