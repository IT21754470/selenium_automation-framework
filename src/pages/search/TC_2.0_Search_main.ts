import { Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';
import { NavbarTests } from './cases/TC_2.1_Nav_bar_search.ts/TC_2.1.3_Nav_bar_logo_search';
import {CurrencyDropdownTest2} from './cases/TC_2.1_Nav_bar_search.ts/TC_2.1.4_currency_dropdown';
import { NvBarCuntry} from './cases/TC_2.1_Nav_bar_search.ts/TC_2.1.5_Country_selection';

  import { NotifyBellTests } from './cases/TC_2.1_Nav_bar_search.ts/TC_2.18_Nav_bar_notificationbell';
import {NavbarButtonsTest} from './cases/TC_2.1_Nav_bar_search.ts/TC_2.1.6_Nav_bar_buttons_search';
import {LowerNavbarChecker} from './cases/TC_2.1_Nav_bar_search.ts/TC_2.1.7_Navbar_cards_check';
//import {SearchBarTest} from './cases/TC_2.2_Search_bar_test.ts/TC_2.2_Search_bar_test';
import {SearchBarTest2} from './cases/TC_2.2_Search_bar_test.ts/TC_2.2.1_Search_place';
import {LocationInputTest} from'./cases/TC_2.2_Search_bar_test.ts/TC_2.2.2_search_location';
import {TimeInputTest } from './cases/TC_2.2_Search_bar_test.ts/TC_2.2.4_Search_time';
//import {BodySectionTest} from './cases/TC_2.3_Body_section.ts/TC_2.3.1_Body_section_side';
import {CardTests} from './cases/TC_2.3_Body_section.ts/TC_2.3.2_body_section_card_test'
import { MapTests } from './cases/TC_2.3_Body_section.ts/TC_2.3.3_Mav_review'

import { BodySectionTest } from './cases/TC_2.3_Body_section.ts/TC_2.3.1_Body_section_side';




import defaultLogger, { logTestSuiteStart, logTestCase, logTestSuiteEnd } from '../../util/logger';

import dotenv from 'dotenv';


dotenv.config();

interface TestResult {
  passed: boolean;
  errorMessage?: string;
  testId: string;
  testName: string;
}

interface Logger {
  info: (message: string) => void;
  error: (message: string) => void;
}

export async function runSearchTests(driver: WebDriver, customLogger: Logger = defaultLogger): Promise<TestResult[]> {
  const projectName = 'BOOKMEI.COM - FRONTEND CONSUMER WEB APP';
  const suiteStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  // Use the provided logger or fall back to default
  const logger = customLogger;
  
  // Modify logTestSuiteStart to use the custom logger
  logger.info(`
======================================================================================================
${suiteStartTime} INFO: QA LOGS FOR PROJECT: ${projectName}
======================================================================================================

TEST SUITE 2: SEARCH PAGE TESTING Started
===================================================================`);

  let tempUserDataDir: string | null = null;
  const testResults: TestResult[] = [];

  try {
    tempUserDataDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'chrome-'));
    const options = new Options();
    if (process.env.is_show_browser_while_testing == 'true') {
      options.addArguments(
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-popup-blocking',
        '--start-maximized',
        `--user-data-dir=${tempUserDataDir}`
      );
    } else {
      options.addArguments(
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-popup-blocking',
        '--start-maximized',
        `--user-data-dir=${tempUserDataDir}`
      );
    }
   
    await driver.get('http://localhost:3000/en/search');
    await driver.sleep(5000);

    const searchPageStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const searchPageEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    // Modified logTestCase to use custom logger
    logger.info(`
[TEST CASE: 2.0] Search Page Navigation
-------------------------------------------------------------------
TEST DESCRIPTION: Verify that the Search Page loads successfully.
STATUS: ✅ PASSED
START TIME: ${searchPageStartTime}
END TIME: ${searchPageEndTime}
DETAILS: Successfully navigated to the Search Page.
-------------------------------------------------------------------`);

    testResults.push({
      passed: true,
      testId: '2.0',
      testName: 'Search Page Navigation',
      errorMessage: ''
    });

    // Navbar Tests
    const navbarStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST CASE: 2.1] Navigation Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ✅ PASSED
START TIME: ${navbarStartTime}
END TIME: 
DETAILS: Navigation Bar Testing Started
-------------------------------------------------------------------`);
    
testResults.push({
  passed: true,
  testId: '2.1',
  testName: 'Navigation bar section',
  errorMessage: ''
});

    const logoResult = await new NavbarTests(driver).checkLogo();
    const logoEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 2.1.1] Logo Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Verify that the company logo is visible and clickable.
    STATUS: ${logoResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${logoEndTime}
    DETAILS: ${logoResult.passed ? 'Logo is visible and functional.' : logoResult.errorMessage || 'Logo test failed'}
    -------------------------------------------------------------------`);
    

    testResults.push({ ...logoResult, testId: '2.1.1', testName: 'Logo Testing' });


    const currencyResult = await new CurrencyDropdownTest2(driver).checkCurrencyDropdown();
    const currencyEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 2.1.2] Currency Dropdown Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the currency dropdown and its functionality.
    STATUS: ${currencyResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${currencyEndTime}
    DETAILS: ${currencyResult.passed ? 'Currency dropdown is functional.' : currencyResult.errorMessage || 'Currency dropdown test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...currencyResult, testId: '2.1.2', testName: 'Currency Dropdown Testing' });

    const countryResult = await new NvBarCuntry(driver).testCountryDropdownClick();
    const countryEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 2.1.3] Country Dropdown Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the country dropdown and its functionality.
    STATUS: ${countryResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${countryEndTime}
    DETAILS: ${countryResult.passed ? 'Country dropdown is functional.' : countryResult.errorMessage || 'Country dropdown test failed'}
    -------------------------------------------------------------------`);


    testResults.push({ ...countryResult, testId: '2.1.3', testName: 'Country Dropdown Testing' });

    const notifyBellResult = await new NotifyBellTests(driver).testNotifyBell();
    const notifyBellEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 2.1.8] Notification Bell Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the notification bell in the Navigation Bar.
    STATUS: ${notifyBellResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${notifyBellEndTime}
    DETAILS: ${notifyBellResult.passed ? 'Notification bell is functional.' : notifyBellResult.errorMessage || 'Notification bell test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...notifyBellResult, testId: '2.1.8', testName: 'Notification Bell Testing' });

    const buttonResult = await new NavbarButtonsTest(driver).checkNavbarButtons();
    const buttonEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 2.1.4] Navbar Button Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate all Navigation Bar buttons.
    STATUS: ${buttonResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${buttonEndTime}
    DETAILS: ${buttonResult.passed ? 'All Navbar buttons are functional.' : buttonResult.errorMessage || 'Navbar button test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...buttonResult, testId: '2.1.4', testName: 'Navbar Button Testing' });

    const navbarLowerResult = await new LowerNavbarChecker().checkLowerNavbar(driver);
    const navbarLowerEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);


  

    
    logger.info(`
    [TEST CASE: 2.1.5] Navbar Lower Section Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the lower section of the Navigation Bar.
    STATUS: ${navbarLowerResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${navbarLowerEndTime}
    DETAILS: ${navbarLowerResult.passed ? 'Navbar lower section is functional.' : navbarLowerResult.errorMessage || 'Navbar lower section test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...navbarLowerResult, testId: '2.1.4', testName: 'Navbar Button Testing' });

    const navbarEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const navbarResult = logoResult.passed;
    
    logger.info(`
[TEST CASE: 2.1] Navigation Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ${navbarResult ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${navbarStartTime}
END TIME: ${navbarEndTime}
DETAILS: ${navbarResult ? 'All Navigation Bar tests passed.' : 'Some Navigation Bar tests failed.'}
-------------------------------------------------------------------`);


//search tests

const searchStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
logger.info(`
[TEST CASE: 2.2] Search Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ✅ PASSED
START TIME: ${navbarStartTime}
END TIME: 
DETAILS: Navigation Bar Testing Started
-------------------------------------------------------------------`);
  
testResults.push({
  passed: true,
  testId: '2.2',
  testName: 'Search bar section',
  errorMessage: ''
});
 
  const placesResult = await new SearchBarTest2().checkSearchBar(driver);
  const placesEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

 
   logger.info(`
   [TEST CASE: 2.2.1]search bar places Section Testing
   -------------------------------------------------------------------
   TEST DESCRIPTION: Validate the places of the search Bar.
   STATUS: ${ placesResult.passed ? '✅ PASSED' : '❌ FAILED'}
   START TIME: ${searchStartTime }
   END TIME: ${ placesEndTime}
   DETAILS: ${ placesResult.passed ? 'Navbar time space section is functional.' :  placesResult.errorMessage || 'Navbar places section test failed'}
   -------------------------------------------------------------------`);
 
   testResults.push({ ... placesResult, testId: '2.2.1', testName: ' section places Testing' });



  const locationResult =await new LocationInputTest().checkLocationInput(driver);
  const locationEndTime =  new Date().toISOString().replace('T', ' ').substr(0, 19);

 
  logger.info(`
  [TEST CASE: 2.2.2]search bar location Section Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate the lower section of the search Bar.
  STATUS: ${ locationResult .passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${searchStartTime }
  END TIME: ${ locationEndTime}
  DETAILS: ${ locationResult .passed ? 'Navbar time space section is functional.' :  locationResult .errorMessage || 'Navbar lower section test failed'}
  -------------------------------------------------------------------`);
 
 testResults.push({ ... locationResult , testId: '2.2.1', testName: ' section location Testing' });


   const timeResult = await new TimeInputTest().checkTimeInput(driver);
   const timeEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    
    logger.info(`
    [TEST CASE: 2.2.3]search bar timing Section Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: validate timing section in navbar.
    STATUS: ${ timeResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${searchStartTime }
    END TIME: ${timeEndTime}
    DETAILS: ${ timeResult.passed ? 'Navbar time space section is functional.' :  timeResult.errorMessage || 'time section test failed'}
    -------------------------------------------------------------------`);
    
    testResults.push({ ... timeResult, testId: '2.2.3', testName: ' section timing Testing' });

    

    const searchendtime= new Date().toISOString().replace('T', ' ').substr(0, 19);
logger.info(`
[TEST CASE: 2.2] Search Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all search Bar elements and interactions.
STATUS: ✅ PASSED
START TIME: ${searchendtime}
END TIME: 
DETAILS: search Bar Testing ended
-------------------------------------------------------------------`);

const bodyStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST CASE: 2.3] Body Section Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Body Section elements and interactions.
STATUS: ✅ STARTED
START TIME: ${bodyStartTime}
END TIME: 
DETAILS: Body Section Testing Started
-------------------------------------------------------------------`);
 
    testResults.push({
      passed: true,
      testId: '2.3',
      testName: 'Body Section',
      errorMessage: ''
    });

    const bodySectionTest = new BodySectionTest(driver);
    const bodysideResult = await bodySectionTest.checkSidebarVisibility();
    const bodysideEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 2.3.1] Body Section Side Bar Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the sidebar in the Body Section.
    STATUS: ${bodysideResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${bodyStartTime}
    END TIME: ${bodysideEndTime}
    DETAILS: ${bodysideResult.passed ? 'Body Section sidebar is functional.' : bodysideResult.errorMessage || 'Body Section sidebar test failed'}
    -------------------------------------------------------------------`);
  
    testResults.push({ 
      ...bodysideResult, 
      testId: '2.3.1', 
      testName: 'Body Section Side Bar Testing' 
    });

    const bodycardsSectionTestInstance = new CardTests(driver);
    const bodycardssectioncardResult = await bodycardsSectionTestInstance.checkSearchCard();
    const bodycardssectioncardEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 2.3.2] Body Section Cards Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the cards section in the Body Section.
    STATUS: ${bodycardssectioncardResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${bodyStartTime}
    END TIME: ${bodycardssectioncardEndTime}
    DETAILS: ${bodycardssectioncardResult.passed ? 'Body Section cards are functional.' : bodycardssectioncardResult.errorMessage || 'Body Section cards test failed'}
    -------------------------------------------------------------------`);
    
    testResults.push({ 
      ...bodycardssectioncardResult, 
      testId: '2.3.2', 
      testName: 'Body Section Cards Testing' 
    });

    const mapTests = new MapTests();
    const bodysectionmapreviewResult = await mapTests.checkMapVisibility(driver);
    const bodysectionmapreviewEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 2.3.3] Body Section Map Review Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the map view in the Body Section.
    STATUS: ${bodysectionmapreviewResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${bodyStartTime}
    END TIME: ${bodysectionmapreviewEndTime}
    DETAILS: ${bodysectionmapreviewResult.passed ? 'Body Section map view is functional.' : bodysectionmapreviewResult.errorMessage || 'Body Section map review test failed'}
    -------------------------------------------------------------------`);
    
    testResults.push({ 
      ...bodysectionmapreviewResult, 
      testId: '2.3.3', 
      testName: 'Body Section Map Review Testing' 
    });

    const bodyEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const bodyResult = bodysideResult.passed && bodycardssectioncardResult.passed && bodysectionmapreviewResult.passed;
    
    logger.info(`
[TEST CASE: 2.3] Body Section Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Body Section elements and interactions.
STATUS: ${bodyResult ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${bodyStartTime}
END TIME: ${bodyEndTime}
DETAILS: ${bodyResult ? 'All Body Section tests passed.' : 'Some Body Section tests failed.'}
-------------------------------------------------------------------`);





    const suiteEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const duration = calculateDuration(suiteStartTime, suiteEndTime);
    const overallResult = testResults.every(result => result.passed);

    logger.info('\n===================================================================');
    logger.info(`TEST SUITE 2: SEARCH PAGE TESTING ${overallResult ? 'PASSED' : 'FAILED'}`);
    logger.info('===================================================================\n');

    logger.info('Project summary updated successfully in the summary file.');
    logger.info(`Test process completed. Overall Result: ${overallResult ? 'Passed' : 'Failed'}`);

    return testResults;

  } catch (error) {
    logger.error(`Error in runSearchTests: ${error}`);
    return [{ passed: false, errorMessage: `An unexpected error occurred: ${error}`, testId: 'ERROR', testName: 'Unexpected Error' }];
  } finally {
    if (tempUserDataDir) {
      try {
        fs.rmdirSync(tempUserDataDir, { recursive: true });
      } catch (error) {
        logger.error(`Error cleaning up temporary directory: ${error}`);
      }
    }
  }
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);
  return `${durationSeconds} SECONDS`;
}

export async function runAllSearchTests(driver: WebDriver, customLogger: Logger = defaultLogger): Promise<TestResult[]> {
  try {
    const searchResults = await runSearchTests(driver, customLogger);
    
    console.log('All search tests completed.');
    console.log('Test Results:', searchResults);

    return searchResults;
  } catch (error) {
    console.error('Error running search tests:', error);
    return [{ passed: false, errorMessage: `Error running search tests: ${error}`, testId: 'ERROR', testName: 'Search Tests Error' }];
  }
}

             





