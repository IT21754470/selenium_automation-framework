import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingFiltersTest2 {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 20000): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementToBeVisible(locator: By, timeout: number = 20000): Promise<WebElement> {
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
    await this.driver.sleep(500); // Wait for scroll to complete
  }

  async checkPaymentButton(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkPaymentButton...');

      await this.retryOperation(async () => {
        const bookingsTab = await this.waitForElementToBeVisible(By.xpath("//h3[text()='Bookings']"));
        await this.scrollIntoView(bookingsTab);
        await bookingsTab.click();
        console.log('Clicked Bookings tab');
      });

      await this.driver.sleep(2000);

      const paymentButtonLocator = By.css("body > main > div.w-full.flex.items-center.justify-center > div > div > div.w-full.h-full.flex.flex-col > div.hidden.lg\\:block > div > div > div > aside > div > div.w-full.flex.items-center.justify-center.flex-row > div:nth-child(3) > div");

      await this.retryOperation(async () => {
        const paymentButton = await this.waitForElementToBeVisible(paymentButtonLocator);
        await this.scrollIntoView(paymentButton);

        if (!(await paymentButton.isDisplayed())) {
          throw new Error("Payment button is not visible");
        }
        console.log("Payment button is visible");

        if (!(await paymentButton.isEnabled())) {
          throw new Error("Payment button is not clickable");
        }
        console.log("Payment button is clickable");

        await paymentButton.click();
        console.log("Clicked payment button");
      });

      return {
        passed: true,
        testId: 'TC_3.2.7',
        testName: 'Payment Button Check'
      };

    } catch (error) {
      console.error('Payment button check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.7',
        testName: 'Payment Button Check',
        errorMessage: `Payment button check failed: ${(error as Error).message}`
      };
    }
  }

  async checkPaymentData(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkPaymentData...');

      const paymentDataContainer = await this.waitForElementToBeVisible(By.css("div.w-full.h-\\[500px\\].2xl\\:h-\\[550px\\].border-\\[2px\\].border-\\[#292929\\].rounded-lg.shadow-md.flex.flex-col.px-4.py-2.gap-3"));
      
      if (!(await paymentDataContainer.isDisplayed())) {
        throw new Error("Payment data container is not visible");
      }
      console.log("Payment data container is visible");

      // Check for specific elements in the payment data
      const elementsToCheck = [
        { name: "Service Provider", xpath: "//h3[text()='Service Provider:']/following-sibling::h3[text()='Hair Studio']" },
        { name: "Total Price", xpath: "//h3[text()='Total Price:']/following-sibling::h3[text()='2400.00']" },
        { name: "Payment Type", xpath: "//h3[text()='Payment Type']/following-sibling::h3[text()='Card']" },
        { name: "Paid By", xpath: "//h3[text()='Paid By']/following-sibling::h3[text()='John Rov.']" },
        { name: "Date & Time", xpath: "//h3[text()='Date & Time']/following-sibling::h3[contains(text(), '2025-1-10 10:00 AM')]" },
        { name: "Payment Status", xpath: "//p[text()='Payment Successful']" }
      ];

      for (const element of elementsToCheck) {
        const elementPresent = await this.retryOperation(async () => {
          const el = await this.waitForElementToBeVisible(By.xpath(element.xpath));
          return el.isDisplayed();
        });

        if (!elementPresent) {
          throw new Error(`${element.name} is not present or visible in the payment data`);
        }
        console.log(`${element.name} is present and visible`);
      }

      return {
        passed: true,
        testId: 'TC_3.2.8',
        testName: 'Payment Data Check'
      };

    } catch (error) {
      console.error('Payment data check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.8',
        testName: 'Payment Data Check',
        errorMessage: `Payment data check failed: ${(error as Error).message}`
      };
    }
  }

  async checkApproveContent(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkApproveContent...');

      // Locate and click the Approve button
      const approveButtonLocator = By.xpath("//div[contains(@class, 'border-primary') and contains(@class, 'rounded-full')]//svg[contains(@class, 'size-[14px]')]");
      await this.retryOperation(async () => {
        const approveButton = await this.waitForElementToBeVisible(approveButtonLocator);
        await this.scrollIntoView(approveButton);
        await approveButton.click();
        console.log("Clicked Approve button");
      });

      await this.driver.sleep(2000); // Wait for content to load

      // Verify the content of the approval information
      const elementsToCheck = [
        { name: "Booking Approval Title", xpath: "//h2[text()='Booking Approval']" },
        { name: "Service Provider", xpath: "//h3[text()='Service Provider:']/following-sibling::h3[text()='Hair Studio']" },
        { name: "Service", xpath: "//h3[text()='Service:']/following-sibling::h3[text()='Hair Cut & Style']" },
        { name: "Booked Number of Members", xpath: "//h3[text()='Booked Number of Members']/following-sibling::h3[text()='1']" },
        { name: "Booked Date", xpath: "//h3[text()='Booked Date']/following-sibling::h3[text()='2022-10-10']" },
        { name: "Booked Time", xpath: "//h3[text()='Booked Time']/following-sibling::h3[text()='10:00 AM - 11:00 AM']" },
        { name: "Approved By", xpath: "//h3[text()='Approved By']/following-sibling::h3[text()='John Doe']" },
        { name: "Approved Date Time", xpath: "//h3[text()='Approved Date Time']/following-sibling::h3[contains(text(), '2025-1-08 12:00 PM')]" },
        { name: "Approved Status", xpath: "//p[text()='Approved']" }
      ];

      for (const element of elementsToCheck) {
        const elementPresent = await this.retryOperation(async () => {
          const el = await this.waitForElementToBeVisible(By.xpath(element.xpath));
          return el.isDisplayed();
        });

        if (!elementPresent) {
          throw new Error(`${element.name} is not present or visible in the approval content`);
        }
        console.log(`${element.name} is present and visible`);
      }

      // Check for the checkmark icon
      const checkmarkIconLocator = By.xpath("//div[contains(@class, 'border-[#292929]')]//svg[contains(@class, 'text-[20px]')]");
      const checkmarkIconPresent = await this.retryOperation(async () => {
        const icon = await this.waitForElementToBeVisible(checkmarkIconLocator);
        return icon.isDisplayed();
      });

      if (!checkmarkIconPresent) {
        throw new Error("Checkmark icon is not present or visible");
      }
      console.log("Checkmark icon is present and visible");

      return {
        passed: true,
        testId: 'TC_3.2.9',
        testName: 'Approve Content Check'
      };

    } catch (error) {
      console.error('Approve content check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.9',
        testName: 'Approve Content Check',
        errorMessage: `Approve content check failed: ${(error as Error).message}`
      };
    }
  }

  async checkDoneButtonAndContent(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkDoneButtonAndContent...');

      // Locate and click the Done button
      const doneButtonLocator = By.xpath("//div[contains(@class, 'bg-white') and contains(@class, 'cursor-pointer') and contains(@class, 'rounded-full')]//svg[contains(@class, 'size-[14px]')]");
      await this.retryOperation(async () => {
        const doneButton = await this.waitForElementToBeVisible(doneButtonLocator);
        await this.scrollIntoView(doneButton);
        await doneButton.click();
        console.log("Clicked Done button");
      });

      await this.driver.sleep(2000); // Wait for content to load

      // Verify the content after clicking the Done button
      const elementsToCheck = [
        { name: "Service Provider", xpath: "//h3[text()='Service Provider:']/following-sibling::h3[text()='Hair Studio']" },
        { name: "Service", xpath: "//h3[text()='Service:']/following-sibling::h3[text()='Hair Cut & Style']" },
        { name: "Booked Number of Members", xpath: "//h3[text()='Booked Number of Members']/following-sibling::h3[text()='1']" },
        { name: "Booked Date", xpath: "//h3[text()='Booked Date']/following-sibling::h3[text()='2022-10-10']" },
        { name: "Booked Time", xpath: "//h3[text()='Booked Time']/following-sibling::h3[text()='10:00 AM - 11:00 AM']" },
        { name: "Approved By", xpath: "//h3[text()='Approved By']/following-sibling::h3[text()='John Doe']" },
        { name: "Approved Date Time", xpath: "//h3[text()='Approved Date Time']/following-sibling::h3[contains(text(), '2025-1-08 12:00 PM')]" }
      ];

      for (const element of elementsToCheck) {
        const elementPresent = await this.retryOperation(async () => {
          const el = await this.waitForElementToBeVisible(By.xpath(element.xpath));
          return el.isDisplayed();
        });

        if (!elementPresent) {
          throw new Error(`${element.name} is not present or visible in the done content`);
        }
        console.log(`${element.name} is present and visible`);
      }

      // Check for the "Approved" status and checkmark icon
      const approvedStatusLocator = By.xpath("//p[text()='Approved']");
      const checkmarkIconLocator = By.xpath("//div[contains(@class, 'border-[#292929]')]//svg[contains(@class, 'text-[20px]')]");

      const approvedStatusPresent = await this.retryOperation(async () => {
        const status = await this.waitForElementToBeVisible(approvedStatusLocator);
        return status.isDisplayed();
      });

      const checkmarkIconPresent = await this.retryOperation(async () => {
        const icon = await this.waitForElementToBeVisible(checkmarkIconLocator);
        return icon.isDisplayed();
      });

      if (!approvedStatusPresent) {
        throw new Error("Approved status is not present or visible");
      }
      console.log("Approved status is present and visible");

      if (!checkmarkIconPresent) {
        throw new Error("Checkmark icon is not present or visible");
      }
      console.log("Checkmark icon is present and visible");

      return {
        passed: true,
        testId: 'TC_3.2.10',
        testName: 'Done Button and Content Check'
      };

    } catch (error) {
      console.error('Done button and content check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.10',
        testName: 'Done Button and Content Check',
        errorMessage: `Done button and content check failed: ${(error as Error).message}`
      };
    }
  }

  async checkReviewContent(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkReviewContent...');

      // Locate and click the Review button
      const reviewButtonLocator = By.xpath("//div[contains(@class, 'animate-pulse') and contains(@class, 'bg-primary') and contains(@class, 'cursor-pointer')]//svg[contains(@class, 'size-[14px]')]");
      await this.retryOperation(async () => {
        const reviewButton = await this.waitForElementToBeVisible(reviewButtonLocator);
        await this.scrollIntoView(reviewButton);
        await reviewButton.click();
        console.log("Clicked Review button");
      });

      await this.driver.sleep(2000); // Wait for content to load

      // Verify the content of the review information
      const elementsToCheck = [
        { name: "Service Review Title", xpath: "//h2[text()='Service Review']" },
        { name: "Review Instruction", xpath: "//p[text()='Please provide your review for the service provider and the service']" },
        { name: "Ratings Tab", xpath: "//div[contains(@class, 'border-primary') and text()='Ratings']" },
        { name: "Reviews Tab", xpath: "//div[contains(@class, 'border-white') and text()='Reviews']" },
        { name: "Rate Service Provider", xpath: "//h3[text()='Rate the Service Provider:']" },
        { name: "Rate Service", xpath: "//h3[text()='Rate the Service:']" },
        { name: "Rate Professional", xpath: "//h3[text()='Rate your service professional']" }
      ];

      for (const element of elementsToCheck) {
        const elementPresent = await this.retryOperation(async () => {
          const el = await this.waitForElementToBeVisible(By.xpath(element.xpath));
          return el.isDisplayed();
        });

        if (!elementPresent) {
          throw new Error(`${element.name} is not present or visible in the review content`);
        }
        console.log(`${element.name} is present and visible`);
      }

      // Check for star ratings
      const starRatingLocator = By.xpath("//svg[contains(@class, 'text-yellow-400')]");
      const starRatings = await this.driver.findElements(starRatingLocator);
      if (starRatings.length !== 15) { // 5 stars for each of the 3 rating categories
        throw new Error(`Expected 15 star ratings, but found ${starRatings.length}`);
      }
      console.log("All star ratings are present");

      // Check for the "Continue" button
      const continueButtonLocator = By.xpath("//div[contains(@class, 'bg-[#292929]')]//p[text()='Continue']");
      const continueButton = await this.waitForElementToBeVisible(continueButtonLocator);
      if (!(await continueButton.isDisplayed())) {
        throw new Error("Continue button is not visible");
      }
      console.log("Continue button is visible");

      return {
        passed: true,
        testId: 'TC_3.2.12',
        testName: 'Review Content Check'
      };

    } catch (error) {
      console.error('Review content check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.12',
        testName: 'Review Content Check',
        errorMessage: `Review content check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingFiltersTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingFiltersTest2(driver);
  const paymentButtonResult = await test.checkPaymentButton();

  if (!paymentButtonResult.passed) {
    return paymentButtonResult;
  }

  const paymentDataResult = await test.checkPaymentData();

  if (!paymentDataResult.passed) {
    return paymentDataResult;
  }

  const approveContentResult = await test.checkApproveContent();

  if (!approveContentResult.passed) {
    return approveContentResult;
  }

  const doneButtonAndContentResult = await test.checkDoneButtonAndContent();

  if (!doneButtonAndContentResult.passed) {
    return doneButtonAndContentResult;
  }

  const reviewContentResult = await test.checkReviewContent();

  // Combine results
  const passed = paymentButtonResult.passed && paymentDataResult.passed && approveContentResult.passed && doneButtonAndContentResult.passed && reviewContentResult.passed;
  const errorMessage = passed ? undefined : `${paymentButtonResult.errorMessage || ''} ${paymentDataResult.errorMessage || ''} ${approveContentResult.errorMessage || ''} ${doneButtonAndContentResult.errorMessage || ''} ${reviewContentResult.errorMessage || ''}`.trim();

  return {
    passed,
    testId: 'TC_3.2',
    testName: 'Booking Filters Testing',
    errorMessage
  };
}

