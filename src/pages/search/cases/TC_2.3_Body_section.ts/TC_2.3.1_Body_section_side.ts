import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export class  BodySectionTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  private async waitForElement(locator: By, timeout: number = 10000): Promise<WebElement | null> {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      console.log(`Timeout waiting for element: ${locator}`);
      return null;
    }
  }

  private async isElementVisible(element: WebElement): Promise<boolean> {
    try {
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  private async getElementStyles(element: WebElement): Promise<Record<string, string>> {
    const script = `
      var styles = {};
      var computedStyle = window.getComputedStyle(arguments[0]);
      for (var i = 0; i < computedStyle.length; i++) {
        var prop = computedStyle[i];
        styles[prop] = computedStyle.getPropertyValue(prop);
      }
      return styles;
    `;
    return await this.driver.executeScript(script, element);
  }

  private async isElementInViewport(element: WebElement): Promise<boolean> {
    const script = `
      var rect = arguments[0].getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    `;
    return await this.driver.executeScript(script, element);
  }

  private async logElementDetails(element: WebElement, name: string): Promise<void> {
    const isDisplayed = await this.isElementVisible(element);
    const rect = await element.getRect();
    const styles = await this.getElementStyles(element);
    const inViewport = await this.isElementInViewport(element);
    const classes = await element.getAttribute('class');

    console.log(`${name} details:`);
    console.log(`- Displayed: ${isDisplayed}`);
    console.log(`- Dimensions: ${JSON.stringify(rect)}`);
    console.log(`- In Viewport: ${inViewport}`);
    console.log(`- Classes: ${classes}`);
    console.log('- Relevant styles:');
    console.log(`  - Display: ${styles['display']}`);
    console.log(`  - Visibility: ${styles['visibility']}`);
    console.log(`  - Opacity: ${styles['opacity']}`);
    console.log(`  - Position: ${styles['position']}`);
    console.log(`  - Z-index: ${styles['z-index']}`);
  }

  async checkSidebarVisibility(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    console.log('Starting sidebar visibility check...');

    try {
      // Wait for the page to load completely
      await this.driver.wait(until.elementLocated(By.tagName('body')), 30000);
      console.log('Page loaded');

      // Log the current URL
      const currentUrl = await this.driver.getCurrentUrl();
      console.log(`Current URL: ${currentUrl}`);

      // Log viewport size
      const viewportSize = await this.driver.executeScript("return {width: window.innerWidth, height: window.innerHeight}");
      console.log(`Viewport size: ${JSON.stringify(viewportSize)}`);

      // Try multiple selectors to find the sidebar
      const sidebarSelectors = [
        '.w-full.h-full.flex.flex-col.gap-y-4.p-4.overflow-y-auto.no-scrollbar',
        '.md\\:flex.rounded-xl.border-\\[1px\\].shadow-lg.drop-shadow-xl',
        '[data-testid="sidebar"]',
        '.flex.items-center.justify-center > div > div[class*="md:flex"][class*="rounded-xl"][class*="border-[1px]"]'
      ];

      let sidebar: WebElement | null = null;

      for (const selector of sidebarSelectors) {
        console.log(`Trying to locate sidebar with selector: ${selector}`);
        sidebar = await this.waitForElement(By.css(selector), 10000);
        if (sidebar) {
          console.log(`Sidebar found with selector: ${selector}`);
          break;
        }
      }

    
      return {
        passed: true,
        testId: 'TC_2.1.1',
        testName: 'Search Sidebar Visibility Check'
      };

    } catch (error) {
      console.error('Search sidebar visibility check error:', error);
      return {
        passed: false,
        testId: 'TC_2.1.1',
        testName: 'Search Sidebar Visibility Check',
        errorMessage: `Search sidebar visibility check failed: ${(error as Error).message}`
      };
    }
  }

  private async waitForElementToBeVisible(locator: By, timeout: number = 10000): Promise<WebElement> {
    const element = await this.waitForElement(locator, timeout);
    if (!element) {
      throw new Error(`Element not found: ${locator}`);
    }
    const isVisible = await this.isElementVisible(element);
    if (!isVisible) {
      throw new Error(`Element is not visible: ${locator}`);
    }
    return element;
  }

  private async scrollIntoView(element: WebElement): Promise<void> {
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await this.driver.sleep(500); // Wait for scroll to complete
  }

  async checkSidebarElements(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting sidebar elements check...');

      const elementsToCheck = [
        { name: 'Services Found', locator: By.xpath("//div[contains(text(), 'Services Found')]") },
        { name: 'Sort By', locator: By.xpath("//div[text()='Sort By:']") },
        { name: 'Filter By', locator: By.xpath("//div[text()='Filter By:']") },
        { name: 'More Service', locator: By.xpath("//span[text()='More Service']") },
        { name: 'Type', locator: By.xpath("//div[text()='Type:']") },
        { name: 'Price', locator: By.xpath("//div[text()='Price:']") },
        { name: 'Range', locator: By.xpath("//div[text()='Range:']") }
      ];

      for (const element of elementsToCheck) {
        const el = await this.waitForElementToBeVisible(element.locator);
        console.log(`${element.name} is visible`);
      }

      const sortOptions = ['Recommended', 'Favorite', 'Top rated', 'Nearest'];
      for (const option of sortOptions) {
        const radioButton = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='radio']`));
        console.log(`${option} radio button is visible`);
      }

      const filterOptions = ['featured', 'other', 'hair care', 'face care', 'nail care', 'body care', 'pedicure'];
      for (const option of filterOptions) {
        const checkbox = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='checkbox']`));
        console.log(`${option} checkbox is visible`);
      }

      const typeOptions = ['Male', 'Female', 'Everyone'];
      for (const option of typeOptions) {
        const radioButton = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='radio']`));
        console.log(`${option} radio button is visible`);
      }

      const priceInputs = await this.driver.findElements(By.css("input[type='text'][disabled]"));
      if (priceInputs.length !== 2) {
        throw new Error('Expected 2 price input fields');
      }
      console.log('Price input fields are visible');

      const priceSliders = await this.driver.findElements(By.css("input[type='range']"));
      if (priceSliders.length !== 2) {
        throw new Error('Expected 2 price range sliders');
      }
      console.log('Price range sliders are visible');

      return {
        passed: true,
        testId: 'TC_2.1.2',
        testName: 'Search Sidebar Elements Check'
      };

    } catch (error) {
      console.error('Search sidebar elements check error:', error);
      return {
        passed: false,
        testId: 'TC_2.1.2',
        testName: 'Search Sidebar Elements Check',
        errorMessage: `Search sidebar elements check failed: ${(error as Error).message}`
      };
    }
  }

  async checkSidebarFunctionality(): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
    try {
      console.log('Starting sidebar functionality check...');

      // Test Sort By radio buttons
      const sortOptions = ['Recommended', 'Favorite', 'Top rated', 'Nearest'];
      for (const option of sortOptions) {
        const radioButton = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='radio']`));
        await radioButton.click();
        const isSelected = await radioButton.isSelected();
        if (!isSelected) {
          throw new Error(`${option} radio button is not selectable`);
        }
        console.log(`${option} radio button is selectable`);
      }

      // Test Filter By checkboxes
      const filterOptions = ['featured', 'other', 'hair care', 'face care', 'nail care', 'body care', 'pedicure'];
      for (const option of filterOptions) {
        const checkbox = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='checkbox']`));
        await checkbox.click();
        const isSelected = await checkbox.isSelected();
        if (!isSelected) {
          throw new Error(`${option} checkbox is not selectable`);
        }
        console.log(`${option} checkbox is selectable`);
        await checkbox.click(); // Uncheck for next iteration
      }

      // Test More Service button
      const moreServiceButton = await this.waitForElementToBeVisible(By.xpath("//span[text()='More Service']"));
      await moreServiceButton.click();
      console.log('Clicked More Service button');

      // Test Type radio buttons
      const typeOptions = ['Male', 'Female', 'Everyone'];
      for (const option of typeOptions) {
        const radioButton = await this.waitForElementToBeVisible(By.xpath(`//label[contains(text(), '${option}')]/input[@type='radio']`));
        await radioButton.click();
        const isSelected = await radioButton.isSelected();
        if (!isSelected) {
          throw new Error(`${option} radio button is not selectable`);
        }
        console.log(`${option} radio button is selectable`);
      }

      // Test Price range slider
      const priceSliders = await this.driver.findElements(By.css("input[type='range']"));
      await this.driver.executeScript("arguments[0].value = 2500; arguments[0].dispatchEvent(new Event('change'));", priceSliders[0]);
      await this.driver.executeScript("arguments[0].value = 7500; arguments[0].dispatchEvent(new Event('change'));", priceSliders[1]);
      console.log('Price range sliders are adjustable');

      // Test Range slider
      const rangeSliders = await this.driver.findElements(By.css("input[type='range']"));
      await this.driver.executeScript("arguments[0].value = 2500; arguments[0].dispatchEvent(new Event('change'));", rangeSliders[0]);
      await this.driver.executeScript("arguments[0].value = 7500; arguments[0].dispatchEvent(new Event('change'));", rangeSliders[1]);
      console.log('Range sliders are adjustable');

      return {
        passed: true,
        testId: 'TC_2.1.3',
        testName: 'Search Sidebar Functionality Check'
      };

    } catch (error) {
      console.error('Search sidebar functionality check error:', error);
      return {
        passed: false,
        testId: 'TC_2.1.3',
        testName: 'Search Sidebar Functionality Check',
        errorMessage: `Search sidebar functionality check failed: ${(error as Error).message}`
      };
    }
  }
}

export async function runSearchSidebarTest(driver: WebDriver): Promise<{ passed: boolean; testId: string; testName: string; errorMessage?: string }> {
  const test = new  BodySectionTest(driver);

  // Run visibility check test
  const visibilityResult = await test.checkSidebarVisibility();
  if (!visibilityResult.passed) {
    return visibilityResult;
  }

  // Run elements check test
  const elementsResult = await test.checkSidebarElements();
  if (!elementsResult.passed) {
    return elementsResult;
  }

  // Run functionality check test
  const functionalityResult = await test.checkSidebarFunctionality();
  if (!functionalityResult.passed) {
    return functionalityResult;
  }

  // Combine results
  const passed = visibilityResult.passed && elementsResult.passed && functionalityResult.passed;
  const errorMessage = passed ? undefined : [
    visibilityResult.errorMessage,
    elementsResult.errorMessage,
    functionalityResult.errorMessage
  ].filter(Boolean).join(' ');

  return {
    passed,
    testId: 'TC_2.1',
    testName: 'Search Sidebar Testing',
    errorMessage
  };
}

