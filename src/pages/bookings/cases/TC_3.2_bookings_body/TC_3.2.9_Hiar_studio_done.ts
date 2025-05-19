import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingFiltersTest4 {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 10000): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementOrNull(locator: By, timeout: number = 5000): Promise<WebElement | null> {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      return null;
    }
  }

  private async clickdoneButton(): Promise<void> {
    try {
      const doneButton = await this.waitForElement(
        By.xpath("//button[contains(@class, 'bg-white') and .//svg[contains(@class, 'size-[14px]')]")
      );
      await doneButton.click();
      console.log('Done button clicked');
      await this.driver.sleep(2000);
      
    } catch (error) {
      console.error('Error clicking done button:', error);
      throw error;
    }
  }
  private async verifyBookingCardsVisibility(filterName: string) {
    try {
      const cards = await this.waitForElementOrNull(
        By.css("div.w-full.flex.flex-row.gap-3.p-3")
      );
      
      const noBookingsMessage = await this.waitForElementOrNull(
        By.xpath("//p[contains(text(), 'No bookings') or contains(text(), 'No results')]")
      );

      if (!cards && !noBookingsMessage) {
        console.warn(`No booking cards or "no bookings" message found for ${filterName} filter`);
      } else {
        console.log(`Filter ${filterName} working as expected`);
      }
    } catch (error) {
      console.warn(`Error checking booking cards for ${filterName}:`, error);
    }
  }

  async checkBookingFilters(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);
      await this.clickdoneButton();
      const allFilterButton = { 
        name: 'All', 
        locator: By.xpath("//div[contains(@class, 'cursor-pointer')][contains(@class, 'bg-[#292929]')]")
      };

      console.log(`Navigating to ${allFilterButton.name} filter`);
      const button = await this.waitForElement(allFilterButton.locator);

      if (!(await button.isDisplayed())) {
        throw new Error(`${allFilterButton.name} filter button is not visible`);
      }
      console.log(`${allFilterButton.name} button is visible`);

      if (!(await button.isEnabled())) {
        throw new Error(`${allFilterButton.name} filter button is not clickable`);
      }
      console.log(`${allFilterButton.name} button is clickable`);

      await button.click();
      await this.driver.sleep(2000);
      console.log(`Clicked ${allFilterButton.name} button`);

      const buttonClasses = await button.getAttribute('class');
      console.log(`${allFilterButton.name} button classes after click:`, buttonClasses);

      const backgroundColor = await button.getCssValue('background-color');
      console.log(`${allFilterButton.name} button background-color:`, backgroundColor);

      await this.verifyBookingCardsVisibility(allFilterButton.name);

      return {
        passed: true,
        testId: 'TC_3.2.4',
        testName: 'All Booking Filter Navigation'
      };

    } catch (error) {
      console.error('All booking filter navigation error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.4',
        testName: 'All Booking Filter Navigation',
        errorMessage: `All booking filter navigation failed: ${(error as Error).message}`
      };
    }
  }

  async checkPaymentButton(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);

      const paymentButton = await this.waitForElement(By.xpath("//button[contains(@class, 'border-primary') and .//svg[contains(@class, 'size-[14px]')]]"));
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

      const paymentModal = await this.waitForElement(By.xpath("//div[contains(@class, 'modal') or contains(@class, 'payment-form')]"));
      if (await paymentModal.isDisplayed()) {
        console.log("Payment modal/form appeared successfully");
      } else {
        throw new Error("Payment modal/form did not appear after clicking the payment button");
      }

      return {
        passed: true,
        testId: 'TC_3.2.5',
        testName: 'Payment Button Check'
      };

    } catch (error) {
      console.error('Payment button check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.5',
        testName: 'Payment Button Check',
        errorMessage: `Payment button check failed: ${(error as Error).message}`
      };
    }
  }

  async checkApproveButton(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);

      const approveButton = await this.waitForElement(By.xpath("//button[contains(@class, 'border-primary') and .//svg[contains(@class, 'size-[14px]')]][2]"));
      if (!(await approveButton.isDisplayed())) {
        throw new Error("Approve button is not visible");
      }
      console.log("Approve button is visible");

      if (!(await approveButton.isEnabled())) {
        throw new Error("Approve button is not clickable");
      }
      console.log("Approve button is clickable");

      await approveButton.click();
      console.log("Clicked approve button");

      const approvalConfirmation = await this.waitForElementOrNull(By.xpath("//div[contains(text(), 'Approved') or contains(@class, 'approval-confirmation')]"));
      if (approvalConfirmation) {
        console.log("Approval confirmation appeared successfully");
      } else {
        console.warn("No explicit approval confirmation found. Checking for other indicators.");
        
        const updatedButtonState = await approveButton.getAttribute('class');
        if (updatedButtonState.includes('approved') || updatedButtonState.includes('success')) {
          console.log("Approve button state changed, indicating successful approval");
        } else {
          throw new Error("No confirmation or visual indication of approval success");
        }
      }

      return {
        passed: true,
        testId: 'TC_3.2.6',
        testName: 'Approve Button Check'
      };

    } catch (error) {
      console.error('Approve button check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.6',
        testName: 'Approve Button Check',
        errorMessage: `Approve button check failed: ${(error as Error).message}`
      };
    }
  }

  async checkDoneButton(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);

      const doneButton = await this.waitForElement(By.xpath("//button[contains(@class, 'bg-white') and .//svg[contains(@class, 'size-[14px]')]]"));
      if (!(await doneButton.isDisplayed())) {
        throw new Error("Done button is not visible");
      }
      console.log("Done button is visible");

      if (!(await doneButton.isEnabled())) {
        throw new Error("Done button is not clickable");
      }
      console.log("Done button is clickable");

      await doneButton.click();
      console.log("Clicked done button");

      // Wait for confirmation or status change
      const confirmationElement = await this.waitForElementOrNull(By.xpath("//div[contains(text(), 'Completed') or contains(@class, 'completion-confirmation')]"));
      if (confirmationElement) {
        console.log("Completion confirmation appeared successfully");
      } else {
        console.warn("No explicit completion confirmation found. Checking for other indicators.");
        
        const updatedButtonState = await doneButton.getAttribute('class');
        if (updatedButtonState.includes('completed') || updatedButtonState.includes('success')) {
          console.log("Done button state changed, indicating successful completion");
        } else {
          // Check if the booking status has changed to 'Completed' or similar
          const bookingStatus = await this.waitForElementOrNull(By.xpath("//div[contains(text(), 'Completed') or contains(text(), 'Done')]"));
          if (bookingStatus) {
            console.log("Booking status changed to Completed");
          } else {
            throw new Error("No confirmation or visual indication of completion success");
          }
        }
      }

      return {
        passed: true,
        testId: 'TC_3.2.7',
        testName: 'Done Button Check'
      };

    } catch (error) {
      console.error('Done button check error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.7',
        testName: 'Done Button Check',
        errorMessage: `Done button check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingFiltersTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingFiltersTest4(driver);
  const filterResult = await test.checkBookingFilters();
  const paymentResult = await test.checkPaymentButton();
  const approveResult = await test.checkApproveButton();
  const doneResult = await test.checkDoneButton();

  // Combine results
  const passed = filterResult.passed && paymentResult.passed && approveResult.passed && doneResult.passed;
  const errorMessage = passed ? undefined : `${filterResult.errorMessage || ''} ${paymentResult.errorMessage || ''} ${approveResult.errorMessage || ''} ${doneResult.errorMessage || ''}`.trim();

  return {
    passed,
    testId: 'TC_3.2',
    testName: 'Booking Filters, Payment, Approve, and Done Test',
    errorMessage
  };
}

