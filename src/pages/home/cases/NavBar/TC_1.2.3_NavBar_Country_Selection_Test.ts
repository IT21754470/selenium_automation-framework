import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import logger from '../../../../util/logger';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NvBarCuntry {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async testCountryDropdownClick(): Promise<TestResult> {
    try {
      const dropdownSelector = "body > main > div.w-full.bg-primary.hidden.md\\:flex.items-center.justify-center.sticky.top-0.z-\\[2000\\] > div > div.flex.flex-col.xl\\:flex-row.gap-x-4 > div > div.w-\\[94px\\].py-1.px-2.relative.ease-in-out.duration-300.transition-all.rounded-l-full.rounded-r-full.bg-white.cursor-pointer.text-black.uppercase.flex.items-center.justify-center.gap-x-2";

      let dropdown: WebElement | null = null;
      try {
        await this.driver.wait(
          until.elementLocated(By.css("div[class*='sticky top-0']")),
          30000
        );

        dropdown = await this.driver.wait(
          until.elementLocated(By.css(dropdownSelector)),
          20000
        );
        
        await this.driver.wait(until.elementIsVisible(dropdown), 10000);
        await this.driver.wait(until.elementIsEnabled(dropdown), 10000);

        await this.driver.sleep(2000);

        await this.driver.executeScript(`
          arguments[0].scrollIntoView(true);
          window.scrollBy(0, -100);
        `, dropdown);

        await this.driver.sleep(1000);

        try {
          await dropdown.click();
        } catch (clickError) {
          try {
            await this.driver.executeScript("arguments[0].click();", dropdown);
          } catch (jsClickError) {
            const actions = this.driver.actions({async: true});
            await actions.move({origin: dropdown}).click().perform();
          }
        }

        await this.driver.sleep(1000);

        const dropdownOptionSelectors = [
          "//ul[contains(@class, 'absolute') and contains(@class, 'bg-white')]",
          "//div[contains(@class, 'absolute') and contains(@class, 'bg-white')]//li",
          "//div[contains(@class, 'dropdown-content')]//li",
          "//div[contains(@class, 'absolute')]//button"
        ];

        for (const selector of dropdownOptionSelectors) {
          try {
            const options = await this.driver.findElements(By.xpath(selector));
            
            logger.debug(`Selector: ${selector}, Options found: ${options.length}`);

            if (options.length > 0) {
              let isDisplayed = false;
              try {
                isDisplayed = await options[0].isDisplayed();
              } catch (displayError) {
                logger.debug(`Error checking if option is displayed: ${displayError}`);
              }

              if (isDisplayed) {
               // logger.info('Country dropdown options are visible after click');
                return await this.selectCountryOption(dropdown, options);
              } else {
                logger.debug('Options found but not displayed');
              }
            }
          } catch (selectorError) {
            logger.debug(`Error with selector ${selector}: ${selectorError}`);
          }
        }

        return { 
          passed: false, 
          errorMessage: 'Country Dropdown Testing Error: Unable to select an option from the dropdown' 
        };

      } catch (error) {
        //logger.error(`Failed to interact with country dropdown: ${error}`);
        return { 
          passed: false, 
          errorMessage: `Country Dropdown Testing Error: Unable to interact with dropdown - ${error}` 
        };
      }
    } catch (error) {
      logger.error(`Unexpected error during country dropdown testing: ${error}`);
      return { 
        passed: false, 
        errorMessage: `Country Dropdown Testing Error: An unexpected error occurred - ${error}` 
      };
    }
  }

  private async selectCountryOption(dropdown: WebElement, options: WebElement[]): Promise<TestResult> {
    const optionToSelect = options[0]; // Select the first option
    await this.driver.wait(until.elementIsEnabled(optionToSelect), 5000);
    
    const originalText = await dropdown.getText();
    const optionText = await optionToSelect.getText();

    try {
      await optionToSelect.click();
    } catch (clickError) {
      try {
        await this.driver.executeScript("arguments[0].click();", optionToSelect);
      } catch (jsClickError) {
        const actions = this.driver.actions({async: true});
        await actions.move({origin: optionToSelect}).click().perform();
      }
    }

    // Wait for the dropdown to close and update
    await this.driver.sleep(2000);

    // Verify the selection
    const selectedText = await dropdown.getText();
    if (selectedText === originalText || selectedText !== optionText) {
      return {
        passed: false,
        errorMessage: `selected LKR or AUD not display properly`
      };
    }

    logger.info(`Successfully selected country option: ${selectedText}`);
    return { passed: true };
  }
}

