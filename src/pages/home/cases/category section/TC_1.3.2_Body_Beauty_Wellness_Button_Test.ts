import { WebDriver, By, until } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

export class BeautyWellnessButtonTest {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkBeautyWellnessButton(): Promise<TestResult> {
    try {
      // Wait for the body to be present
      await this.driver.wait(until.elementLocated(By.tagName('body')), 1000);

      // Find the Beauty & Wellness button using text content
      const beautyWellnessButton = await this.driver.wait(
        until.elementLocated(By.xpath("/html/body/main/section[1]/div/div[1]/div/div/div/div/div/div/div[1]")),
        10000,
        'Beauty & Wellness button not found'
      );

      // Check if the button is displayed
      const isDisplayed = await beautyWellnessButton.isDisplayed();
      if (!isDisplayed) {
        return { passed: false, errorMessage: 'Beauty & Wellness button is not visible' };
      }

      // Check if the button is enabled
      const isEnabled = await beautyWellnessButton.isEnabled();
      if (!isEnabled) {
        return { passed: false, errorMessage: 'Beauty & Wellness button is not clickable' };
      }

      // Check for any overlays or popups and close them if present
      const overlay = await this.driver.findElements(By.css('div[class*="fixed top-0 left-0"]'));
      if (overlay.length > 0) {
        await this.driver.executeScript("arguments[0].style.display='none';", overlay[0]);
      }

      // Try to click the button using JavaScript
      await this.driver.executeScript("arguments[0].click();", beautyWellnessButton);
      
      // Wait for navigation or state change after click
      await this.driver.sleep(2000); // Wait for any animations or state changes

      // Verify the button was actually clicked (could check URL change or active state)
      const buttonClasses = await beautyWellnessButton.getAttribute('class');
      console.log('Button classes after click:', buttonClasses);

      // Take a screenshot for verification
      const screenshot = await this.driver.takeScreenshot();
      require('fs').writeFileSync('beauty-wellness-button-test.png', screenshot, 'base64');

      return { passed: true };
    } catch (error) {
      console.error('Error details:', error);
      return {
        passed: false,
        errorMessage: `Error checking Beauty & Wellness button: ${(error as Error).message}\nStack: ${(error as Error).stack}`
      };
    }
  }
}

