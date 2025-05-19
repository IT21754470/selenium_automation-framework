import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import logger from '../../../../util/logger';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class NavbarTests21 {
  private driver: WebDriver;

  constructor() {
    this.driver = new Builder().forBrowser('chrome').build();
  }

  async testNavbarLoading(url: string): Promise<TestResult> {
    try {
      logger.info('—---------------1.2 Navbar Loading Testing Started—---—----------------------');
      await this.driver.get(url);
      logger.info(`Navigating to ${url}...`);

      try {
        const navbarSelector = 'body > main > div.md\\:hidden.flex.w-full.flex-row.bg-primary.justify-between.items-center.py-4.px-5.sticky.-top-\\[1px\\].z-\\[500\\]';
        const navbar = await this.driver.wait(until.elementLocated(By.css(navbarSelector)), 10000);

        const isNavbarVisible = await navbar.getCssValue('display');
        const menuItems = await navbar.findElements(By.css('.menu-item'));

        if (isNavbarVisible === 'none' || menuItems.length === 0) {
          logger.info('1.2 Navbar Loading Testing Error: Navbar not fully loaded');
          return { passed: false, errorMessage: '1.2 Navbar Loading Testing Error: Navbar not fully loaded' };
        }

        logger.info('1.2 Navbar Loading Testing Passed');
        return { passed: true };
      } catch (navbarError) {
        logger.info('1.2 Navbar Loading Testing Error: Unable to locate navbar');
        return { passed: false, errorMessage: '1.2 Navbar Loading Testing Error: Unable to locate navbar' };
      }
    } catch (error) {
      logger.info('1.2 Navbar Loading Testing Error: Navigation failed');
      return { passed: false, errorMessage: '1.2 Navbar Loading Testing Error: Navigation failed' };
    } finally {
      await this.driver.quit();
      logger.info('—---------------1.2 Navbar Loading Testing Completed—---—----------------------');
    }
  }
}

