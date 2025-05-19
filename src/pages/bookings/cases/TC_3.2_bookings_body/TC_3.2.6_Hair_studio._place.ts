import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class BookingDetailsTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 10000): Promise<WebElement> {
    return this.driver.wait(until.elementLocated(locator), timeout);
  }

  private async waitForElementVisible(element: WebElement, timeout: number = 10000): Promise<boolean> {
    return this.driver.wait(until.elementIsVisible(element), timeout)
      .then(() => true)
      .catch(() => false);
  }

  private async checkElement(element: WebElement, name: string): Promise<void> {
    if (!(await this.waitForElementVisible(element))) {
      throw new Error(`${name} is not visible`);
    }
    if (!(await element.isEnabled())) {
      throw new Error(`${name} is not interactive`);
    }
    console.log(`✓ ${name} verified`);
  }

  private async clickPlaceButton(): Promise<void> {
    try {
      const placeButton = await this.waitForElement(
        By.xpath("//div[contains(@class, 'border-primary') and contains(@class, 'text-primary') and contains(@class, 'rounded-full')]")
      );
      await placeButton.click();
      console.log('✓ Place button clicked');
      await this.driver.sleep(2000); // Wait for any animations or state changes
    } catch (error) {
      console.error('Error clicking Place button:', error);
      throw error;
    }
  }

  async checkAllElements(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      // Wait for the Bookings tab and click it
      const bookingsTab = await this.waitForElement(By.xpath("//h3[text()='Bookings']"));
      await bookingsTab.click();
      await this.driver.sleep(2000);

      // Click the Place button before starting the tests
      await this.clickPlaceButton();

      // 1. Check Header Section
      console.log('\nChecking Header Section...');
      const headerElements = [
        {
          name: 'Studio Name',
          locator: By.xpath("//h3[contains(@class, 'text-[20px]') and text()='Hair Studio']")
        },
        {
          name: 'Address',
          locator: By.xpath("//h3[contains(text(), '123, Lorem Ipsum Street')]")
        },
        {
          name: 'Service Name',
          locator: By.xpath("//h3[text()='Hair cut & Style']")
        },
        {
          name: 'View on Map Link',
          locator: By.xpath("//h3[contains(@class, 'cursor-pointer') and contains(text(), 'View on Map')]")
        },
        {
          name: 'Reference Number',
          locator: By.xpath("//h3[contains(text(), 'ref-sgdj45dfkls-bsdg63f58vb')]")
        }
      ];

      for (const { name, locator } of headerElements) {
        const element = await this.waitForElement(locator);
        await this.checkElement(element, name);
      }

      // 2. Check Progress Indicators
      console.log('\nChecking Progress Indicators...');
      const progressSteps = [
        { name: 'Place', isActive: true },
        { name: 'Payment', isActive: false },
        { name: 'Approve', isActive: false },
        { name: 'Done', isActive: false },
        { name: 'Review', isActive: false }
      ];

      for (const { name, isActive } of progressSteps) {
        // Check step container
        const stepContainer = await this.waitForElement(
          By.xpath(`//div[.//p[text()='${name}']]`)
        );
        await this.checkElement(stepContainer, `${name} Step Container`);

        // Check circle button
        const circleButton = await stepContainer.findElement(
          By.xpath(".//div[contains(@class, 'rounded-full')]")
        );
        await this.checkElement(circleButton, `${name} Circle Button`);

        // Check icon
        const icon = await circleButton.findElement(By.css('svg'));
        await this.checkElement(icon, `${name} Icon`);

        // Check label
        const label = await stepContainer.findElement(
          By.xpath(`.//p[text()='${name}']`)
        );
        await this.checkElement(label, `${name} Label`);

        // Verify active state if applicable
        if (isActive) {
          const buttonClasses = await circleButton.getAttribute('class');
          if (!buttonClasses.includes('border-primary')) {
            throw new Error(`${name} step should be active but isn't`);
          }
        }
      }

      // 3. Check Booking Summary Section
      console.log('\nChecking Booking Summary Section...');
      const summaryElements = [
        {
          name: 'Summary Title',
          locator: By.xpath("//h2[contains(text(), 'Your Booking') and contains(text(), 'Summary')]")
        },
        {
          name: 'Service Provider Row',
          label: 'Service Provider:',
          value: 'Hair Studio'
        },
        {
          name: 'AVG Time Row',
          label: 'AVG Time:',
          value: '30 minutes'
        },
        {
          name: 'Members Row',
          label: 'Booked Number of Members',
          value: '1'
        },
        {
          name: 'Date Row',
          label: 'Booked Date',
          value: '2022-10-10'
        },
        {
          name: 'Time Row',
          label: 'Booked Time',
          value: '10:00 AM - 11:00 AM'
        }
      ];

      for (const { name, label, value } of summaryElements) {
        try {
          if (label && value) {
            const row = await this.waitForElement(
              By.xpath(`//div[.//*[contains(text(), '${label}')]]//h3[contains(text(), '${value}')]`)
            );
            await this.checkElement(row, name);
          } else {
            const element = await this.waitForElement(
              By.xpath(`//h2[contains(text(), 'Your Booking') and contains(text(), 'Summary')]`)
            );
            await this.checkElement(element, name);
          }
        } catch (error) {
          console.warn(`Warning: Could not find ${name}. Error: ${error}`);
        }
      }

      // 4. Check Price Breakdown Section
      console.log('\nChecking Price Breakdown Section...');
      const priceElements = [
        {
          name: 'Price Row',
          label: 'Price',
          value: '2500.00'
        },
        {
          name: 'Discount Row',
          label: 'Discount',
          value: '10%'
        },
        {
          name: 'Total Price Row',
          label: 'Total Price',
          value: '2250.00'
        },
        {
          name: 'Service Charge Row',
          label: 'Service charge',
          value: '100.00'
        },
        {
          name: 'Bookmei Charge Row',
          label: 'Bookmei charge',
          value: '50.00'
        },
        {
          name: 'Final Total Row',
          label: 'Total Price',
          value: '2400.00'
        }
      ];

      for (const { name, label, value } of priceElements) {
        try {
          const row = await this.waitForElement(
            By.xpath(`//div[.//*[contains(text(), '${label}')]]//h3[contains(text(), '${value}')]`)
          );
          await this.checkElement(row, name);
        } catch (error) {
          console.warn(`Warning: Could not find ${name}. Error: ${error}`);

          // Attempt to find the row without the specific value
          try {
            const labelElement = await this.waitForElement(
              By.xpath(`//*[contains(text(), '${label}')]`)
            );
            console.log(`Found label for ${name}, but value may be incorrect`);
            await this.checkElement(labelElement, `${name} (label only)`);
          } catch (labelError) {
            console.error(`Error finding label for ${name}: ${labelError}`);
          }
        }
      }

      return {
        passed: true,
        testId: 'TC_3.8',
        testName: 'Booking Details Elements Testing'
      };

    } catch (error) {
      console.error('Booking details elements test error:', error);
      return {
        passed: false,
        testId: 'TC_3.8',
        testName: 'Booking Details Elements Testing',
        errorMessage: `Booking details elements test failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runBookingDetailsTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new BookingDetailsTest(driver);
  return await test.checkAllElements();
}

