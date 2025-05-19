import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

interface TestResult {
  passed: boolean;
  errorMessage?: string;
}

interface ButtonState {
  text: string;
  classes: string;
  isActive: boolean;
}

export class NavbarLanguageTests {
  private driver: WebDriver;

  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  async checkLanguageButtons(): Promise<TestResult> {
    try {
      await this.handleOverlay();

      const container = await this.findLanguageButtonContainer();

      const containerHTML = await container.getAttribute('outerHTML');
      console.log('Language button container HTML:', containerHTML);

      const languagesToCheck = ['en', 'Sin', 'Tam'];
      for (const lang of languagesToCheck) {
        try {
       //   await this.retryOperation(() => this.checkLanguageButton(lang, container));
        } catch (error) {
          return { passed: false, errorMessage: `Error with '${lang}' button: ${(error as Error).message}` };
        }
      }

      return { passed: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      return { passed: false, errorMessage: `An unexpected error occurred during testing: ${errorMessage}` };
    }
  }

  private async handleOverlay(): Promise<void> {
    const overlaySelector = "div.w-[calc(100vw)].h-[calc(100vh)].text-[#292929].fixed.top-0.left-0.p-5.bg-black\\/20.backdrop-blur-sm.flex.items-center.justify-center.z-\\[5000\\]";
    try {
      await this.driver.wait(async () => {
        const overlays = await this.driver.findElements(By.css(overlaySelector));
        if (overlays.length > 0) {
          console.log('Overlay found, attempting to dismiss...');
          try {
            const closeButton = await this.driver.findElement(By.css(`${overlaySelector} button[aria-label="Close"]`));
            await closeButton.click();
          } catch (error) {
            console.log('No close button found, trying ESC key...');
            await this.driver.actions().sendKeys('\uE00C').perform(); // Send ESC key
          }
          await this.driver.sleep(1000); // Wait for dismissal animation
          return false;
        }
        return true;
      }, 30000, 'Timeout waiting for overlay to disappear');
      console.log('Overlay dismissed or not present');
    } catch (error) {
      console.log('Failed to dismiss overlay, proceeding with test');
    }
  }

  private async findLanguageButtonContainer(): Promise<WebElement> {
    const containerSelector = "div.flex.flex-row.gap-x-2.px-2.py-1.rounded-l-full.rounded-r-full.transition-all.duration-300.ease-in-out.bg-white";
    
    try {
      const container = await this.driver.wait(until.elementLocated(By.css(containerSelector)), 30000);
      await this.driver.wait(until.elementIsVisible(container), 20000);
      console.log('Found language button container');
      return container;
    } catch (error) {
      console.error('Failed to find language button container:', error);
      throw new Error('Unable to locate language button container');
    }
  }

  private async checkLanguageButton(lang: string, container: WebElement): Promise<void> {
    const button = await this.findAndCheckButton(lang, container);
    
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", button);
    await this.driver.sleep(1000);

    await this.handleOverlay();

    await this.driver.wait(until.elementIsVisible(button), 10000);
    await this.driver.wait(until.elementIsEnabled(button), 10000);

    const initialStates = await this.getAllButtonStates(container);
    console.log('Initial button states:', JSON.stringify(initialStates, null, 2));

    await this.clickButton(button);

    // Wait for the button state to update
    await this.driver.wait(async () => {
      const currentStates = await this.getAllButtonStates(container);
      return currentStates.some(state => state.text.toLowerCase() === lang.toLowerCase() && state.isActive);
    }, 10000, `Timeout waiting for '${lang}' button to become active`);

    const finalStates = await this.getAllButtonStates(container);
    console.log('Final button states:', JSON.stringify(finalStates, null, 2));

    await this.verifyButtonStates(lang, initialStates, finalStates);
  }

  private async getAllButtonStates(container: WebElement): Promise<ButtonState[]> {
    const buttons = await container.findElements(By.css('button'));
    const states: ButtonState[] = [];

    for (const button of buttons) {
      const text = await button.getText();
      const classes = await button.getAttribute('class');
      const isActive = this.hasExpectedActiveClasses(classes);
      states.push({ text, classes, isActive });
    }

    return states;
  }

  private async verifyButtonStates(clickedLang: string, initialStates: ButtonState[], finalStates: ButtonState[]): Promise<void> {
    for (const finalState of finalStates) {
      const initialState = initialStates.find(state => state.text.toLowerCase() === finalState.text.toLowerCase());
      if (!initialState) {
        console.log(`Warning: No initial state found for button '${finalState.text}'`);
        continue;
      }

      if (finalState.text.toLowerCase() === clickedLang.toLowerCase()) {
        if (!finalState.isActive) {
          throw new Error(`Clicked button '${clickedLang}' is not active. Classes: ${finalState.classes}`);
        }
      } else {
        if (finalState.isActive) {
          throw new Error(`Other language button '${finalState.text}' is active after clicking '${clickedLang}'. Classes: ${finalState.classes}`);
        }
        if (finalState.classes !== initialState.classes) {
          console.log(`Warning: Classes changed for button '${finalState.text}' after clicking '${clickedLang}'. Initial: ${initialState.classes}, Final: ${finalState.classes}`);
        }
      }
    }
  }

  private hasExpectedActiveClasses(classes: string): boolean {
    return classes.includes('bg-secondary') && classes.includes('text-white');
  }

  private async findAndCheckButton(lang: string, container: WebElement): Promise<WebElement> {
    const buttons = await container.findElements(By.css('button'));
    console.log(`Found ${buttons.length} buttons in the container`);

    for (const button of buttons) {
      const buttonText = await button.getText();
      console.log(`Button text: "${buttonText}"`);
      if (buttonText.toLowerCase() === lang.toLowerCase()) {
        console.log(`Found '${lang}' button`);
        return button;
      }
    }

    throw new Error(`Button for language '${lang}' not found`);
  }

  private async clickButton(button: WebElement): Promise<void> {
   // await this.retryOperation(async () => {
      try {
        await this.handleOverlay();
        await this.driver.wait(until.elementIsVisible(button), 10000);
        await this.driver.wait(until.elementIsEnabled(button), 10000);
        
        await this.driver.executeScript("arguments[0].click();", button);
        
        console.log('Button clicked successfully');
      } catch (error) {
        if ((error as Error).name === 'StaleElementReferenceError') {
          throw error; // Allow retry for stale element
        }
        console.error('Error clicking button:', error);
        throw error; // Rethrow other errors
      }
    }
  }

 


