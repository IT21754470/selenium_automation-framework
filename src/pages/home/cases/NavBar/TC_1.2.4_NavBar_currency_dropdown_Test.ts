import { By, until, WebDriver } from 'selenium-webdriver';
import logger from '../../../../util/logger';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class CurrencyDropdownTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkCurrencyDropdown(): Promise<TestResult> {
    try {
      const dropdown = await this.driver.wait(
        until.elementLocated(By.css('div.cursor-pointer.bg-white.text-black.uppercase')),
        10000
      );

      if (await dropdown.isDisplayed()) {
        const options = await dropdown.findElements(By.css('option'));
        const optionTexts = await Promise.all(options.map(option => option.getText()));

        if (optionTexts.includes('AUD') && optionTexts.includes('LKR')) {
          for (const currency of ['AUD', 'LKR']) {
            await dropdown.sendKeys(currency);
            await this.driver.sleep(1000);

            const selectedOption = await dropdown.getAttribute('value');
            if (selectedOption !== currency) {
              return { passed: false, errorMessage: `Failed to select ${currency}` };
            }
          }
          return { passed: true };
        } else {
          return { passed: false, errorMessage: ' selected LKR or AUD not display properly' };
        }
      } else {
        return { passed: false, errorMessage: 'Currency dropdown is not visible' };
      }
    } catch (error) {
      return { passed: false, errorMessage: (error as Error).message };
    }
  }
}

