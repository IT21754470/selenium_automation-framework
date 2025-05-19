import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as fs from 'fs';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

interface FooterLink {
  text: string;
  selector: string;
}

export class FooterTest {
  private async waitForElement(driver: WebDriver, locator: By, timeout: number = 10000): Promise<WebElement> {
    console.log(`Waiting for element: ${locator}`);
    try {
      await driver.wait(until.elementLocated(locator), timeout, `Element not found: ${locator}`);
      const element = await driver.findElement(locator);
      await driver.wait(until.elementIsVisible(element), timeout, `Element not visible: ${locator}`);
      console.log(`Element found and visible: ${locator}`);
      return element;
    } catch (error) {
      console.error(`Error while waiting for element ${locator}:`, error);
      throw error;
    }
  }

  private async findElementWithMultipleSelectors(driver: WebDriver, selectors: string[]): Promise<WebElement | null> {
    for (const selector of selectors) {
      try {
        console.log(`Attempting to find element with selector: ${selector}`);
        if (selector.startsWith('//')) {
          return await this.waitForElement(driver, By.xpath(selector));
        } else {
          return await this.waitForElement(driver, By.css(selector));
        }
      } catch (error) {
        console.log(`Selector ${selector} failed, trying next...`);
      }
    }
    return null;
  }

  async checkFooter(driver: WebDriver): Promise<TestResult> {
    try {
      console.log('Starting footer visibility test...');

      // Find footer element
      const footerSelectors = [
        'footer',
        '[data-testid="footer"]',
        '.footer',
        'div.hidden.md\\:flex.flex-col.items-center.justify-center.bg-primary.py-10.px-20'
      ];

      const footer = await this.findElementWithMultipleSelectors(driver, footerSelectors);
      if (!footer) {
        throw new Error('Footer element not found');
      }
      console.log('Footer element found');

      // Check footer links
      const footerLinks: FooterLink[] = [
        { text: 'Blog', selector: 'a[href="/blog"]' },
        { text: 'Faq', selector: 'a[href="/faq"]' },
        { text: 'About Us', selector: 'a[href="/about-us"]' },
        { text: 'Contact Us', selector: 'a[href="/contact-us"]' },
        { text: 'Privacy Policy', selector: 'a[href="/privacy-policy"]' },
        { text: 'Terms Of Service', selector: 'a[href="/terms-and-conditions"]' }
      ];

      for (const link of footerLinks) {
        console.log(`Checking footer link: ${link.text}`);
        const linkElement = await footer.findElement(By.css(link.selector));
        const isDisplayed = await linkElement.isDisplayed();
        const linkText = await linkElement.getText();
        
        if (!isDisplayed) {
          throw new Error(`Footer link "${link.text}" is not visible`);
        }
        if (!linkText.toLowerCase().includes(link.text.toLowerCase())) {
          throw new Error(`Footer link text mismatch. Expected: "${link.text}", Found: "${linkText}"`);
        }
        console.log(`Footer link "${link.text}" is visible and correct`);
      }

      // Check logo
      const logoSelectors = [
        'img[alt="logo"]',
        '.footer-logo',
        '[data-testid="footer-logo"]'
      ];

      const logo = await this.findElementWithMultipleSelectors(driver, logoSelectors);
      if (!logo || !(await logo.isDisplayed())) {
        throw new Error('Footer logo not found or not visible');
      }
      console.log('Footer logo is visible');

      // Check copyright text
      const copyrightSelectors = [
        'h3:contains("© 2024")',
        '.copyright',
        '[data-testid="copyright"]',
        '//h3[contains(text(), "© 2024")]'
      ];

      const copyright = await this.findElementWithMultipleSelectors(driver, copyrightSelectors);
      if (!copyright || !(await copyright.isDisplayed())) {
        throw new Error('Copyright text not found or not visible');
      }
      const copyrightText = await copyright.getText();
      if (!copyrightText.includes('© 2024 BookMei Solution PVT LTD. All rights reserved.')) {
        throw new Error(`Copyright text incorrect. Found: "${copyrightText}"`);
      }
      console.log('Copyright text is visible and correct');

      // Check social media icons
      const socialIcons = await footer.findElements(By.css('a[href*="facebook"], a[href*="instagram"], a[href*="x.com"]'));
      if (socialIcons.length !== 3) {
        throw new Error(`Expected 3 social media icons, found ${socialIcons.length}`);
      }
      for (const icon of socialIcons) {
        if (!(await icon.isDisplayed())) {
          throw new Error('Not all social media icons are visible');
        }
      }
      console.log('All social media icons are visible');

      // Take verification screenshot
      console.log('Taking verification screenshot...');
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('footer-test.png', screenshot, 'base64');

      console.log('Footer visibility test completed successfully');
      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      
      // Take failure screenshot
      try {
        const failureScreenshot = await driver.takeScreenshot();
        fs.writeFileSync('footer-test-failure.png', failureScreenshot, 'base64');
      } catch (screenshotError) {
        console.error('Failed to take failure screenshot:', screenshotError);
      }

      return {
        passed: false,
        errorMessage: `Error in footer test: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}