import { WebDriver, By, until } from 'selenium-webdriver';
import assert from 'assert';

export class BookingsNavigationTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkNavigationButtons(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      // Wait for navigation buttons to be present
      const calendarButton = await this.driver.wait(
        until.elementLocated(By.xpath("//h3[contains(text(), 'Calerndar')]")),
        1000
      );
      const bookingsButton = await this.driver.wait(
        until.elementLocated(By.xpath("//h3[contains(text(), 'Bookings')]")),
        1000
      );
      const reviewsButton = await this.driver.wait(
        until.elementLocated(By.xpath("//h3[contains(text(), 'Reviews')]")),
        1000
      );

      // Check if all buttons are visible
      assert(await calendarButton.isDisplayed(), 'Calendar button is not visible');
      assert(await bookingsButton.isDisplayed(), 'Bookings button is not visible');
      assert(await reviewsButton.isDisplayed(), 'Reviews button is not visible');

      // Check if all buttons are clickable and show correct view
      await calendarButton.click();
      await this.driver.sleep(1000);
      const calendarView = await this.driver.findElement(By.xpath("//div[contains(@class, 'border-b-primary')]"));
      assert(await calendarView.isDisplayed(), 'Calendar view is not displayed after clicking');

      await bookingsButton.click();
      await this.driver.sleep(1000);
      const bookingsView = await this.driver.findElement(By.xpath("//div[contains(@class, 'border-b-primary')]"));
      assert(await bookingsView.isDisplayed(), 'Bookings view is not displayed after clicking');

      await reviewsButton.click();
      await this.driver.sleep(1000);
      const reviewsView = await this.driver.findElement(By.xpath("//div[contains(@class, 'border-b-primary')]"));
      assert(await reviewsView.isDisplayed(), 'Reviews view is not displayed after clicking');

      // Navigate back to the calendar page
      await calendarButton.click();
      await this.driver.sleep(1000);
      const finalCalendarView = await this.driver.findElement(By.xpath("//div[contains(@class, 'border-b-primary')]"));
      assert(await finalCalendarView.isDisplayed(), 'Calendar view is not displayed after final navigation');

      return {
        passed: true,
        testId: 'TC_3.1',
        testName: 'Bookings Page Navigation Test (with final calendar navigation)'
      };

    } catch (error) {
      return {
        passed: false,
        testId: 'TC_3.1',
        testName: 'Bookings Page Navigation Test',
        errorMessage: `Navigation test failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingsNavigationTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingsNavigationTest(driver);
  return await test.checkNavigationButtons();
}

