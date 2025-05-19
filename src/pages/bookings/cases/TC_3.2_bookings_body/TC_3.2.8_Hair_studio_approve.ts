import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingFiltersTest3 {
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

  async checkApprovalButton(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting checkApprovalButton...');

      // Navigate to the Bookings tab
      await this.retryOperation(async () => {
        const bookingsTab = await this.waitForElementToBeVisible(By.xpath("//h3[text()='Bookings']"));
        await this.scrollIntoView(bookingsTab);
        await bookingsTab.click();
        console.log('Clicked Bookings tab');
      });

      await this.driver.sleep(2000);

      // Locate and click the approval button
      const approvalButtonLocator = By.css("div.border-primary.text-primary.size-\\[44px\\].rounded-full.border-\\[2px\\].border-\\[#292929\\].flex.items-center.justify-center.shadow-md");

      await this.retryOperation(async () => {
        const approvalButton = await this.waitForElementToBeVisible(approvalButtonLocator);
        await this.scrollIntoView(approvalButton);

        if (!(await approvalButton.isDisplayed())) {
          throw new Error("Approval button is not visible");
        }
        console.log("Approval button is visible");

        if (!(await approvalButton.isEnabled())) {
          throw new Error("Approval button is not clickable");
        }
        console.log("Approval button is clickable");

        await approvalButton.click();
        console.log("Clicked approval button");
      });

      // Wait for the approval content container to be visible
      const containerLocator = By.css("div.px-2.h-full.overflow-y-auto.transparent-scrollbar");
      const container = await this.waitForElementToBeVisible(containerLocator);

      if (!(await container.isDisplayed())) {
        throw new Error("Approval content container is not visible");
      }
      console.log("Approval content container is visible");

      // Check for specific elements in the approval content
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

      return {
        passed: true,
        testId: 'TC_3.2.9',
        testName: 'Approval Button and Content Check'
      };

    } catch (error) {
      console.error('Approval button and content check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.9',
        testName: 'Approval Button and Content Check',
        errorMessage: `Approval button and content check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingFiltersTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingFiltersTest3(driver);
  const approvalResult = await test.checkApprovalButton();

  return {
    passed: approvalResult.passed,
    testId: 'TC_3.2',
    testName: 'Booking Approval Testing',
    errorMessage: approvalResult.errorMessage
  };
}

