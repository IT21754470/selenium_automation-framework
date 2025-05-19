import { Builder, By, until } from 'selenium-webdriver';


export async function loadPage() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
   // await driver.get('http://localhost:3000/'); // Replace with your URL
    console.log('Page loaded successfully!');

    // Optional wait or interaction
    await driver.sleep(20000); // Pause for 5 seconds for visual verification
  } catch (error) {
    console.error('Error while loading page:', error);
  } finally {
    await driver.quit();
  }
}
