import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class HistoryTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 1000): Promise<WebElement> {
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
        console.warn(`Attempt ${attempt} failed: ${(error as Error).message}`);
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

  private async getVisibleElement(elements: WebElement[]): Promise<WebElement | null> {
    for (const element of elements) {
      if (await element.isDisplayed()) {
        return element;
      }
    }
    return null;
  }

  async navigateToHistory(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting navigation to History tab...');

      // First navigate to the Bookings page if not already there
      const bookingsTab = await this.waitForElementToBeVisible(By.xpath("//h3[text()='Bookings']"));
      await this.scrollIntoView(bookingsTab);
      await bookingsTab.click();
      console.log('Clicked Bookings tab');

      await this.driver.sleep(2000);

      // Navigate to Reviews tab
      const reviewsTab = await this.waitForElementToBeVisible(By.xpath("//div[contains(@class, 'border-b-[2px]')]//h3[text()='Reviews']"));
      await this.scrollIntoView(reviewsTab);
      await reviewsTab.click();
      console.log('Clicked Reviews tab');

      await this.driver.sleep(2000);

      // Locate and click the History tab
      const historyTabLocators = [
        By.xpath("//div[contains(@class, 'cursor-pointer') and contains(@class, 'bg-[#292929]') and contains(text(), 'History')]"),
        By.xpath("//div[contains(@class, 'rounded-l-full') and contains(@class, 'rounded-r-full') and contains(@class, 'bg-[#292929]')]//div[contains(text(), 'History')]"),
        By.css("div.cursor-pointer.bg-\\[\\#292929\\]"),
        By.xpath("//div[text()='History' and contains(@class, 'bg-[#292929]')]"),
      ];

      let historyTab: WebElement | null = null;
      for (const locator of historyTabLocators) {
        try {
          historyTab = await this.waitForElementToBeVisible(locator, 5000);
          if (historyTab) {
            console.log(`Found History tab with locator: ${locator}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to find History tab with locator: ${locator}`);
        }
      }

      if (!historyTab) {
        throw new Error("Unable to locate History tab");
      }

      await this.scrollIntoView(historyTab);
      await historyTab.click();
      console.log("Clicked History tab");

      await this.driver.sleep(2000);

      return {
        passed: true,
        testId: 'TC_3.7.1',
        testName: 'Navigate to History Tab'
      };

    } catch (error) {
      console.error('Navigation to History tab error:', error);
      return {
        passed: false,
        testId: 'TC_3.7.1',
        testName: 'Navigate to History Tab',
        errorMessage: `Navigation to History tab failed: ${(error as Error).message}`
      };
    }
  }

  async checkHistoryContent(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting History content check...');

      // Ensure we're on the History tab
      const navigationResult = await this.navigateToHistory();
      if (!navigationResult.passed) {
        throw new Error(navigationResult.errorMessage);
      }

      // Wait for potential loading state with increased timeout
      await this.driver.sleep(10000);

      console.log('Attempting to locate history content...');

      // Use a more flexible locator for the history section
      const historySectionLocators = [
        By.xpath("//div[contains(@class, 'w-full') and contains(@class, 'flex') and contains(@class, 'flex-col')]"),
        By.css("div.w-full.flex.flex-col"),
        By.xpath("//div[contains(@class, 'flex-col') and .//div[contains(@class, 'flex') and contains(@class, 'flex-col')]]"),
        By.xpath("//div[contains(@class, 'overflow-y-auto')]"),
        By.css("div.overflow-y-auto"),
        By.xpath("//div[contains(@class, 'flex') and contains(@class, 'flex-col') and contains(@class, 'gap-4')]"),
      ];

      let historySection: WebElement | null = null;
      for (const locator of historySectionLocators) {
        try {
          historySection = await this.retryOperation(
            async () => this.waitForElementToBeVisible(locator, 5000),
            3,
            2000
          );
          if (historySection) {
            console.log(`Found history section with locator: ${locator}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to find history section with locator: ${locator}`);
        }
      }

      if (!historySection) {
        // If we still can't find the history section, let's log the page source for debugging
        const pageSource = await this.driver.getPageSource();
        console.log('Page source:', pageSource);
        throw new Error("Unable to locate history section");
      }

      console.log("History section is visible");

      // Check for the presence of history cards with retry
      const historyCards = await this.retryOperation(async () => {
        const cardLocators = [
          By.xpath(".//div[contains(@class, 'flex') and contains(@class, 'flex-col') and contains(@class, 'sm:flex-row')]"),
          By.css("div.flex.flex-col.sm\\:flex-row"),
          By.xpath(".//div[contains(@class, 'rounded-lg') and contains(@class, 'shadow-md')]"),
        ];

        for (const locator of cardLocators) {
          const cards = await historySection!.findElements(locator);
          const visibleCards = await Promise.all(cards.map(card => this.getVisibleElement([card])));
          const filteredCards = visibleCards.filter(card => card !== null) as WebElement[];
          if (filteredCards.length > 0) {
            return filteredCards;
          }
        }

        throw new Error("No history cards found");
      }, 3, 5000);

      console.log(`Found ${historyCards.length} history cards`);

      // Check elements within each history card
      for (let i = 0; i < historyCards.length; i++) {
        const card = historyCards[i];
        console.log(`Checking history card ${i + 1}`);

        const cardElementsToCheck = [
          { name: "Service Image", xpath: ".//img[@alt='booking']" },
          { name: "Service Title", xpath: ".//h2[contains(@class, 'text-[14px]')]" },
          { name: "Venue Name", xpath: ".//p[contains(@class, 'text-gray-700')]" },
          { name: "Address", xpath: ".//p[contains(@class, 'text-gray-500')]" },
          { name: "Time", xpath: ".//p[contains(text(), 'AM') or contains(text(), 'PM')]" },
          { name: "Price", xpath: ".//p[contains(text(), 'LKR')]" },
          { name: "Add Review Button", xpath: ".//div[contains(@class, 'bg-[#292929]') or contains(@class, 'cursor-pointer')]//p[contains(text(), 'Review') or contains(text(), 'review')]" },
        ];

        for (const element of cardElementsToCheck) {
          await this.retryOperation(async () => {
            const els = await card.findElements(By.xpath(element.xpath));
            if (els.length === 0) {
              throw new Error(`${element.name} is not found in card ${i + 1}`);
            }
            const visibleEls = await Promise.all(els.map(el => el.isDisplayed()));
            if (!visibleEls.some(isVisible => isVisible)) {
              throw new Error(`${element.name} is found but not visible in card ${i + 1}`);
            }
            console.log(`${element.name} is present and visible in card ${i + 1}`);
          }, 3, 2000);
        }

        // Log the entire card HTML for debugging
        console.log(`Card ${i + 1} HTML:`, await card.getAttribute('outerHTML'));

        // Fallback check for Add Review button
        const addReviewButton = await card.findElements(By.xpath(".//div[contains(@class, 'bg-[#292929]') or contains(@class, 'cursor-pointer')]//p[contains(text(), 'Review') or contains(text(), 'review')]"));
        if (addReviewButton.length === 0) {
          console.log(`Add Review button not found in card ${i + 1}. Checking for alternative elements.`);
          const alternativeElements = await card.findElements(By.xpath(".//div[contains(@class, 'cursor-pointer')]"));
          if (alternativeElements.length > 0) {
            console.log(`Found ${alternativeElements.length} potential interactive elements in card ${i + 1}.`);
            for (let j = 0; j < alternativeElements.length; j++) {
              console.log(`Alternative element ${j + 1} HTML:`, await alternativeElements[j].getAttribute('outerHTML'));
            }
          } else {
            console.warn(`No interactive elements found in card ${i + 1}. This may indicate a problem with the card's structure.`);
          }
          throw new Error(`Add Review Button is not found in card ${i + 1}`);
        }


        // Check for icons
        const icons = await card.findElements(By.css('svg'));
        if (icons.length < 3) { // Assuming at least 3 icons: venue, location, and time
          throw new Error(`Expected at least 3 icons in card ${i + 1}, but found ${icons.length}`);
        }
        console.log(`All required icons are present in card ${i + 1}`);
      }

      // Check for pagination if there are multiple pages
      const paginationElement = await this.driver.findElements(By.xpath("//div[contains(@class, 'flex') and contains(@class, 'justify-center')]//button"));
      if (paginationElement.length > 0) {
        console.log("Pagination is present");
        // You can add more checks for pagination functionality here if needed
      } else {
        console.log("No pagination found, assuming single page of history");
      }

      return {
        passed: true,
        testId: 'TC_3.7.2',
        testName: 'History Content Check'
      };

    } catch (error) {
      console.error('History content check error:', error);
      // Log the entire page source for debugging
      console.log('Page source:', await this.driver.getPageSource());
      return {
        passed: false,
        testId: 'TC_3.7.2',
        testName: 'History Content Check',
        errorMessage: `History content check failed: ${(error as Error).message}`
      };
    }
  }

  async checkAddReviewInteraction(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting Add Review interaction check...');

      // Ensure we're on the History tab and content is loaded
      const contentResult = await this.checkHistoryContent();
      if (!contentResult.passed) {
        throw new Error(contentResult.errorMessage);
      }

      // Find and click the Add Review button
      const addReviewButtonLocators = [
        By.xpath("//div[contains(@class, 'bg-[#292929]')]//p[text()='Add Review']"),
        By.css("div.bg-\\[\\#292929\\] p"),
        By.xpath("//p[text()='Add Review']"),
      ];

      let addReviewButton: WebElement | null = null;
      for (const locator of addReviewButtonLocators) {
        try {
          addReviewButton = await this.waitForElementToBeVisible(locator, 5000);
          if (addReviewButton) {
            console.log(`Found Add Review button with locator: ${locator}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to find Add Review button with locator: ${locator}`);
        }
      }

      if (!addReviewButton) {
        throw new Error("Unable to locate Add Review button");
      }

      await this.scrollIntoView(addReviewButton);
      await addReviewButton.click();
      console.log("Clicked Add Review button");

      // Wait for the review form to appear
      await this.driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'flex flex-col gap-4') and contains(@class, 'overflow-y-auto')]")), 10000);
      console.log("Review form appeared");

      await this.driver.sleep(2000);

      console.log('Starting review form checks...');
      // Verify the review form container
      const reviewFormContainer = await this.waitForElementToBeVisible(
        By.xpath("//div[contains(@class, 'flex flex-col gap-4') and contains(@class, 'overflow-y-auto')]")
      );
      if (!(await reviewFormContainer.isDisplayed())) {
        throw new Error("Review form container is not visible");
      }
      console.log("Review form container is visible");

      // Verify the booking details card
      const bookingDetailsCard = await this.waitForElementToBeVisible(
        By.xpath("//div[contains(@class, 'w-full bg-white rounded-lg p-3 flex flex-row gap-3')]")
      );
      if (!(await bookingDetailsCard.isDisplayed())) {
        throw new Error("Booking details card is not visible");
      }
      console.log("Booking details card is visible");

      console.log('Checking review sections...');
      const reviewSections = [
        "Service Provider Review and Rating",
        "Service Review and Rating",
        "Service Provider Review and Rating"
      ];

      for (const sectionTitle of reviewSections) {
        try {
          console.log(`Checking section: ${sectionTitle}`);

          const sectionPresent = await this.retryOperation(async () => {
            const section = await this.driver.findElement(By.xpath(`//h2[text()='${sectionTitle}']`));
            return section.isDisplayed();
          });

          if (!sectionPresent) {
            throw new Error(`${sectionTitle} section is not present or visible`);
          }
          console.log(`${sectionTitle} section is present and visible`);

          // Verify star ratings for each section
          const starRatings = await this.driver.findElements(
            By.xpath(`//h2[text()='${sectionTitle}']/following-sibling::div//svg[contains(@class, 'w-[30px]')]`)
          );
          if (starRatings.length !== 5) {
            throw new Error(`Expected 5 star ratings for ${sectionTitle}, but found ${starRatings.length}`);
          }
          console.log(`Star ratings for ${sectionTitle} are present`);

          // Verify textarea for each section and input text
          const textarea = await this.driver.findElement(
            By.xpath(`//h2[text()='${sectionTitle}']/following-sibling::div//textarea`)
          );
          if (!(await textarea.isDisplayed())) {
            throw new Error(`Textarea for ${sectionTitle} is not visible`);
          }
          console.log(`Textarea for ${sectionTitle} is present and visible`);

          // Input text into textarea
          const testText = `Test review for ${sectionTitle}`;
          await textarea.sendKeys(testText);
          const inputtedText = await textarea.getAttribute('value');
          if (inputtedText !== testText) {
            throw new Error(`Failed to input text into textarea for ${sectionTitle}`);
          }
          console.log(`Successfully input text into textarea for ${sectionTitle}`);

          // Verify photo upload area for each section
          const photoUpload = await this.driver.findElement(
            By.xpath(`//h2[text()='${sectionTitle}']/following-sibling::div//div[contains(@class, 'cursor-pointer') and contains(@class, 'bg-gray-100')]`)
          );
          if (!(await photoUpload.isDisplayed())) {
            throw new Error(`Photo upload area for ${sectionTitle} is not visible`);
          }
          console.log(`Photo upload area for ${sectionTitle} is present and visible`);

          // Simulate file upload
          const fileInput = await this.driver.findElement(By.css('input[type="file"]'));
          await this.driver.executeScript("arguments[0].style.display = 'block';", fileInput);
          await fileInput.sendKeys('/path/to/test/image.jpg');
          console.log(`Simulated file upload for ${sectionTitle}`);

          // Wait for upload indication (adjust based on your UI)
          await this.driver.wait(until.elementLocated(By.xpath(`//h2[text()='${sectionTitle}']/following-sibling::div//img`)), 5000);
          console.log(`File upload confirmed for ${sectionTitle}`);

          console.log(`Successfully checked ${sectionTitle} section`);
        } catch (error) {
          console.error(`Error in ${sectionTitle} section:`, error);
          throw error;
        }
      }
      console.log('Finished checking all review sections');

      return {
        passed: true,
        testId: 'TC_3.7.3',
        testName: 'Add Review Interaction Check'
      };

    } catch (error) {
      console.error('Add Review interaction check error:', error);
      return {
        passed: false,
        testId: 'TC_3.7.3',
        testName: 'Add Review Interaction Check',
        errorMessage: `Add Review interaction check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runHistoryTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new HistoryTest(driver);

  // Run navigation test
  const navigationResult = await test.navigateToHistory();
  if (!navigationResult.passed) {
    return navigationResult;
  }

  // Run content check test
  const contentResult = await test.checkHistoryContent();
  if (!contentResult.passed) {
    return contentResult;
  }

  // Run add review interaction test
  const addReviewResult = await test.checkAddReviewInteraction();
  if (!addReviewResult.passed) {
    return addReviewResult;
  }

  // Combine results
  const passed = navigationResult.passed && contentResult.passed && addReviewResult.passed;
  const errorMessage = passed ? undefined : [
    navigationResult.errorMessage,
    contentResult.errorMessage,
    addReviewResult.errorMessage
  ].filter(Boolean).join(' ');

  return {
    passed,
    testId: 'TC_3.7',
    testName: 'History Testing',
    errorMessage
  };
}

