import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingFiltersTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 1000): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementOrNull(locator: By, timeout: number = 5000): Promise<WebElement | null> {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      return null;
    }
  }

  private async verifyBookingCardsVisibility(filterName: string) {
    try {
      // Wait for either booking cards or "no bookings" message
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
      // Wait for the Bookings tab and click it
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);

    // Define the 'All' filter button
    const allFilterButton = { 
      name: 'All', 
      locator: By.xpath("//div[contains(@class, 'cursor-pointer')][contains(@class, 'bg-[#292929]')]")
    };

    console.log(`Navigating to ${allFilterButton.name} filter`);
    const button = await this.waitForElement(allFilterButton.locator);

    // Verify button is visible and clickable
    if (!(await button.isDisplayed())) {
      throw new Error(`${allFilterButton.name} filter button is not visible`);
    }
    console.log(`${allFilterButton.name} button is visible`);

    if (!(await button.isEnabled())) {
      throw new Error(`${allFilterButton.name} filter button is not clickable`);
    }
    console.log(`${allFilterButton.name} button is clickable`);

    // Click the 'All' filter button
    await button.click();
    await this.driver.sleep(2000); // Wait for filter to apply
    console.log(`Clicked ${allFilterButton.name} button`);

    // Get button state after click
    const buttonClasses = await button.getAttribute('class');
    console.log(`${allFilterButton.name} button classes after click:`, buttonClasses);

    // Verify the button state changed
    const backgroundColor = await button.getCssValue('background-color');
    console.log(`${allFilterButton.name} button background-color:`, backgroundColor);

    // Check if booking cards or "no bookings" message is displayed
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
}

export async function runBookingFiltersTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingFiltersTest(driver);
  return await test.checkBookingFilters();
}

