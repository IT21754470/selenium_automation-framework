import { WebDriver, By, until, WebElement, Key } from 'selenium-webdriver';
import * as path from 'path';

export class ReviewsTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 30000): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementToBeVisible(locator: By, timeout: number = 30000): Promise<WebElement> {
    const element = await this.waitForElement(locator, timeout);
    return this.driver.wait(until.elementIsVisible(element), timeout);
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 5, delay: number = 2000): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await this.driver.sleep(delay);
      }
    }
    throw new Error('This line should never be reached');
  }

  private async scrollIntoView(element: WebElement): Promise<void> {
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await this.driver.sleep(500);
  }

  async navigateToReviews(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting navigation to Reviews tab...');

      // First navigate to the Bookings page if not already there
      const bookingsTab = await this.waitForElementToBeVisible(By.xpath("//h3[text()='Bookings']"));
      await this.scrollIntoView(bookingsTab);
      await bookingsTab.click();
      console.log('Clicked Bookings tab');

      await this.driver.sleep(2000);

      // Locate and click the Reviews tab
      const reviewsTabLocator = By.xpath("//div[contains(@class, 'border-b-[2px]')]//h3[text()='Reviews']");
      await this.retryOperation(async () => {
        const reviewsTab = await this.waitForElementToBeVisible(reviewsTabLocator);
        await this.scrollIntoView(reviewsTab);
        
        // Verify the Reviews tab styling and properties
        const parentElement = await reviewsTab.findElement(By.xpath(".."));
        const classes = await parentElement.getAttribute("class");
        
        if (!classes.includes("cursor-pointer")) {
          throw new Error("Reviews tab is not clickable");
        }

        if (!classes.includes("w-[80px]") && !classes.includes("sm:w-[100px]")) {
          throw new Error("Reviews tab width is incorrect");
        }

        if (!classes.includes("h-[32px]") && !classes.includes("sm:h-[40px]")) {
          throw new Error("Reviews tab height is incorrect");
        }

        // Check text properties
        const textClasses = await reviewsTab.getAttribute("class");
        if (!textClasses.includes("text-[#292929]")) {
          throw new Error("Reviews tab text color is incorrect");
        }

        await reviewsTab.click();
        console.log("Clicked Reviews tab");
      });

      // Verify that the Reviews tab is active (has primary border)
      const activeReviewsTab = await this.waitForElementToBeVisible(
        By.xpath("//div[contains(@class, 'border-b-primary')]//h3[text()='Reviews']")
      );
      
      if (!(await activeReviewsTab.isDisplayed())) {
        throw new Error("Reviews tab is not active after clicking");
      }
      console.log("Reviews tab is active");

      return {
        passed: true,
        testId: 'TC_3.6.1',
        testName: 'Navigate to Reviews Tab'
      };

    } catch (error) {
      console.error('Navigation to Reviews tab error:', error);
      return {
        passed: false,
        testId: 'TC_3.6.1',
        testName: 'Navigate to Reviews Tab',
        errorMessage: `Navigation to Reviews tab failed: ${(error as Error).message}`
      };
    }
  }

  async checkReviewsContent(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting Reviews content check...');

      // First ensure we're on the Reviews tab
      const navigationResult = await this.navigateToReviews();
      if (!navigationResult.passed) {
        throw new Error(navigationResult.errorMessage);
      }

      // Wait for potential loading state
      await this.driver.sleep(3000);
      console.log('Waited for 3 seconds after navigation');

      // Log the current URL
      const currentUrl = await this.driver.getCurrentUrl();
      console.log(`Current URL: ${currentUrl}`);

      // Check if we're on the correct page
      if (!currentUrl.includes('/bookings')) {
        throw new Error(`Unexpected URL: ${currentUrl}. Expected to be on the bookings page.`);
      }

      // Log the page source for debugging
      const pageSource = await this.driver.getPageSource();
      console.log('Page source:', pageSource.substring(0, 500) + '...'); // Log first 500 characters

      // Try different strategies to locate the review cards container
      const containerLocators = [
        By.xpath("//div[contains(@class, 'flex') and contains(@class, 'flex-col') and contains(@class, 'gap-4')]"),
        By.css("div.flex.flex-col.gap-4"),
        By.xpath("//div[contains(@class, 'flex-col') and contains(@class, 'gap-4')]"),
        By.xpath("//div[contains(@class, 'gap-4') and .//div[contains(@class, 'flex-col') or contains(@class, 'flex-row')]]")
      ];

      let reviewCardsContainer: WebElement | null = null;

      for (const locator of containerLocators) {
        try {
          console.log(`Attempting to locate container with: ${locator}`);
          reviewCardsContainer = await this.waitForElementToBeVisible(locator, 10000);
          if (reviewCardsContainer) {
            console.log(`Successfully located container with: ${locator}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to locate container with: ${locator}`);
        }
      }

      if (!reviewCardsContainer) {
        throw new Error("Unable to locate review cards container with any strategy");
      }

      console.log("Review cards container is visible");

      // Check for individual review cards
      const reviewCards = await this.retryOperation(async () => {
        const cards = await reviewCardsContainer!.findElements(
          By.xpath(".//div[contains(@class, 'flex') and (contains(@class, 'flex-col') or contains(@class, 'flex-row'))]")
        );
        if (cards.length === 0) {
          throw new Error("No review cards found");
        }
        return cards;
      });

      console.log(`Found ${reviewCards.length} review cards`);

      // Check elements within the first review card
      const firstCard = reviewCards[0];
      const cardElementsToCheck = [
        { name: "Service Image", xpath: ".//img[@alt='booking']" },
        { name: "Service Title", xpath: ".//h2[contains(@class, 'text-[14px]')]" },
        { name: "Venue Name", xpath: ".//p[contains(@class, 'text-gray-700')]" },
        { name: "Address", xpath: ".//p[contains(@class, 'text-gray-500')]" },
        { name: "Time", xpath: ".//p[contains(text(), 'AM') or contains(text(), 'PM')]" },
        { name: "Price", xpath: ".//p[contains(text(), 'LKR')]" },
        { name: "Add Review Button", xpath: ".//p[text()='Add Review']" }
      ];

      for (const element of cardElementsToCheck) {
        const elementPresent = await this.retryOperation(async () => {
          const el = await firstCard.findElement(By.xpath(element.xpath));
          return el.isDisplayed();
        });

        if (!elementPresent) {
          throw new Error(`${element.name} is not present or visible in the review card`);
        }
        console.log(`${element.name} is present and visible`);
      }

      // Check icons
      const icons = await firstCard.findElements(By.css('svg'));
      if (icons.length < 3) { // Should have venue, location, and time icons
        throw new Error(`Expected at least 3 icons, but found ${icons.length}`);
      }
      console.log("All required icons are present");

      console.log("Completed checking review card elements");


      return {
        passed: true,
        testId: 'TC_3.6.2',
        testName: 'Reviews Content Check'
      };

    } catch (error) {
      console.error('Reviews content check error:', error);
      return {
        passed: false,
        testId: 'TC_3.6.2',
        testName: 'Reviews Content Check',
        errorMessage: `Reviews content check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runReviewsTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new ReviewsTest(driver);

  // Run navigation test
  const navigationResult = await test.navigateToReviews();
  if (!navigationResult.passed) {
    return navigationResult;
  }

  // Run content check test
  const contentResult = await test.checkReviewsContent();
  if (!contentResult.passed) {
    return contentResult;
  }

  // Run add review interaction test
 

  // Combine results
  const passed = navigationResult.passed && contentResult.passed ;
  const errorMessage = passed ? undefined : [
    navigationResult.errorMessage,
    contentResult.errorMessage,
    
  ].filter(Boolean).join(' ');

  return {
    passed,
    testId: 'TC_3.6',
    testName: 'Reviews Testing',
    errorMessage
  };
}

