import { WebDriver, By, until } from 'selenium-webdriver';
import assert from 'assert';

export class CalendarTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkCalendarFunctionality(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      // Wait for the calendar wrapper to be present
      const calendarWrapper = await this.driver.wait(
        until.elementLocated(By.className('sx-react-calendar-wrapper')),
        30000
      );

      // Check if the calendar is visible
      assert(await calendarWrapper.isDisplayed(), 'Calendar is not visible');

      // Check if the "Today" button is present and clickable
      const todayButton = await this.driver.findElement(By.className('sx__today-button'));
      assert(await todayButton.isDisplayed(), 'Today button is not visible');
      await todayButton.click();

      // Check if the navigation buttons are present and clickable
      const prevButton = await this.driver.findElement(By.xpath("//button[.//i[contains(@class, 'sx__chevron--previous')]]"));
      const nextButton = await this.driver.findElement(By.xpath("//button[.//i[contains(@class, 'sx__chevron--next')]]"));
      
      assert(await prevButton.isDisplayed(), 'Previous button is not visible');
      assert(await nextButton.isDisplayed(), 'Next button is not visible');
      
      await prevButton.click();
      await nextButton.click();

      // Check if the view selection is present and clickable
      const viewSelection = await this.driver.findElement(By.className('sx__view-selection-selected-item'));
      assert(await viewSelection.isDisplayed(), 'View selection is not visible');
      await viewSelection.click();

      // Check if the date picker is present and clickable
      const datePicker = await this.driver.findElement(By.className('sx__date-input'));
      assert(await datePicker.isDisplayed(), 'Date picker is not visible');
      await datePicker.click();

      // Check if the time grid is present
      const timeGrid = await this.driver.findElement(By.className('sx__week-grid__time-axis'));
      assert(await timeGrid.isDisplayed(), 'Time grid is not visible');

      return {
        passed: true,
        testId: 'TC_3.2',
        testName: 'Calendar Functionality Test'
      };

    } catch (error) {
      return {
        passed: false,
        testId: 'TC_3.2',
        testName: 'Calendar Functionality Test',
        errorMessage: `Calendar test failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runCalendarTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new CalendarTest(driver);
  return await test.checkCalendarFunctionality();
}

