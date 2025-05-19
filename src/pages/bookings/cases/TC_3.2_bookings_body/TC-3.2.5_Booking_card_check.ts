import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingCardTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 1500): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementOrNull(locator: By, timeout: number = 5000): Promise<WebElement | null> {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      return null;
    }
  }

  private async resetToAllFilter(): Promise<void> {
    try {
      const allButton = await this.waitForElement(
        By.xpath("//div[contains(@class, 'cursor-pointer') and contains(@class, 'bg-[#292929]')]")
      );
      await allButton.click();
      await this.driver.sleep(3000); // Increased wait time
      console.log('Reset to All filter');
    } catch (error) {
      console.warn('Could not reset to All filter:', error);
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await this.driver.sleep(2000); // Wait before retrying
      }
    }
    throw new Error('This line should never be reached');
  }

  async checkBookingCard(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      // Wait for the Bookings tab and click it
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(3000);
      console.log('Clicked on Bookings tab');

      // Reset to "All" filter to ensure we can see the booking cards
      await this.resetToAllFilter();

      // Wait for the booking card with retry mechanism
      const bookingCard = await this.retryOperation(async () => {
        const card = await this.waitForElementOrNull(
          By.xpath("//div[contains(@class, 'w-full')][contains(@class, 'flex')][contains(@class, 'flex-row')][contains(@class, 'gap-3')]")
        );
        if (!card) {
          throw new Error('Booking card not found');
        }
        return card;
      });

      console.log('Booking card found');

      // Check card visibility and interactivity
      if (!(await bookingCard.isDisplayed())) {
        throw new Error('Booking card is not visible');
      }
      if (!(await bookingCard.isEnabled())) {
        throw new Error('Booking card is not clickable');
      }

      // Check image
      const image = await this.retryOperation(() => bookingCard.findElement(By.css('img[alt="booking"]')));
      if (!(await image.isDisplayed())) {
        throw new Error('Booking image is not visible');
      }

      // Check content elements
      const elements = [
        { name: 'title', locator: By.xpath(".//h2[contains(text(), 'Hair Cut & Style')]") },
        { name: 'venue', locator: By.xpath(".//p[contains(text(), 'Hair Studio')]") },
        { name: 'address', locator: By.xpath(".//p[contains(text(), 'Lorem Ipsum Street')]") },
        { name: 'time', locator: By.xpath(".//p[contains(text(), 'AM') or contains(text(), 'PM')]") },
        { name: 'status', locator: By.xpath(".//p[text()='Booked']") },
        { name: 'price', locator: By.xpath(".//p[contains(text(), 'LKR')]") }
      ];

      for (const { name, locator } of elements) {
        const element = await this.retryOperation(() => bookingCard.findElement(locator));
        if (!(await element.isDisplayed())) {
          throw new Error(`${name} is not visible`);
        }
        console.log(`${name} element found and visible`);
      }

      // Check icons
      const icons = await bookingCard.findElements(By.css('svg'));
      if (icons.length < 3) {
        throw new Error('Not all icons are present');
      }
      console.log(`Found ${icons.length} icons`);

      return {
        passed: true,
        testId: 'TC_3.2.5',
        testName: 'Booking Card Testing'
      };

    } catch (error) {
      console.error('Booking card test error:', error);
      return {
        passed: false,
        testId: 'TC_3.2.5',
        testName: 'Booking Card Testing',
        errorMessage: `Booking card test failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingCardTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingCardTest(driver);
  return await test.checkBookingCard();
}

