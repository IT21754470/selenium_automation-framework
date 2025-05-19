import { WebDriver, By, until } from 'selenium-webdriver';

export class SidePanelTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkSidePanelElements(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      // Wait for the side panel to be present by looking for the "Today's Bookings" title
      const sidePanel = await this.driver.wait(
        until.elementLocated(By.xpath("//h2[contains(text(), 'Today`s Bookings')]/ancestor::div[contains(@class, 'flex') and contains(@class, 'flex-col')]")),
        10000
      );

      // Check if the side panel is visible
      if (!(await sidePanel.isDisplayed())) {
        throw new Error('Side panel is not visible');
      }

      // Check for the "Today's Bookings" title
      const title = await sidePanel.findElement(By.xpath(".//h2[contains(text(), 'Today`s Bookings')]"));
      if (!(await title.isDisplayed())) {
        throw new Error('Today\'s Bookings title is not visible');
      }

      // Check for the date
      const date = await sidePanel.findElement(By.xpath(".//p[contains(text(), 'November 27, Thursday')]"));
      if (!(await date.isDisplayed())) {
        throw new Error('Date is not visible');
      }

      // Check for the event cards
      const eventCards = await sidePanel.findElements(By.xpath(".//div[contains(@class, 'w-full') and contains(@class, 'h-[100px]')]"));
      if (eventCards.length !== 3) {
        throw new Error(`Expected 3 event cards, but found ${eventCards.length}`);
      }

      // Check elements of each event card
      for (let i = 0; i < eventCards.length; i++) {
        const card = eventCards[i];
        
        // Check event title
        const eventTitle = await card.findElement(By.xpath(".//h2[contains(@class, 'text-[#292929]') and contains(@class, 'text-[16px]')]"));
        if (!(await eventTitle.isDisplayed())) {
          throw new Error(`Event ${i + 1} title is not visible`);
        }

        // Check location
        const location = await card.findElement(By.xpath(".//p[text()='Classic Barber']"));
        if (!(await location.isDisplayed())) {
          throw new Error(`Event ${i + 1} location is not visible`);
        }

        // Check time
        const time = await card.findElement(By.xpath(".//p[contains(text(), 'AM') or contains(text(), 'PM')]"));
        if (!(await time.isDisplayed())) {
          throw new Error(`Event ${i + 1} time is not visible`);
        }
      }

      return {
        passed: true,
        testId: '3.2.3',
        testName: 'Side Panel Testing'
      };

    } catch (error) {
      return {
        passed: false,
        testId: '3.2.3',
        testName: 'Side Panel Testing',
        errorMessage: `Side panel test failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runSidePanelTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new SidePanelTest(driver);
  return await test.checkSidePanelElements();
}

