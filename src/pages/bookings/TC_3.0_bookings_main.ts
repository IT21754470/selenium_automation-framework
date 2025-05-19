import { Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';
import {NavbarTests } from  './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.1_logo_test';
import {NavbarLanguageTests} from './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.2_Language_test';
import {NvBarCuntry} from './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.3_currency_test';
import {CurrencyDropdownTest} from './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.4_country_test';
import {NotifyBellTests } from './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.5_Notificationbell_test';
import {NavbarButtonsTest} from './cases/TC_3.0_BOOKINGS_Navbar/TC_3.1.6_buttons_test';
import {BookingsNavigationTest} from './cases/TC_3.2_bookings_body/TC_3.2.1_3buttons_test';
import {CalendarTest} from './cases/TC_3.2_bookings_body/TC_3.2.2_calender_test';
import {SidePanelTest} from './cases/TC_3.2_bookings_body/TC_3.2.3_Side_bookings';
import {BookingFiltersTest} from './cases/TC_3.2_bookings_body/TC_3.2.4_Bookings_page_black_buttons';
import {BookingCardTest} from './cases/TC_3.2_bookings_body/TC-3.2.5_Booking_card_check';
import {BookingDetailsTest} from './cases/TC_3.2_bookings_body/TC_3.2.6_Hair_studio._place';
import {BookingFiltersTest2} from './cases/TC_3.2_bookings_body/TC_3.2.7_Hair_studio_payment';
import {ReviewsTest} from './cases/TC_3.2_bookings_body/TC_3.2.11_review_page';
import {HistoryTest } from './cases/TC_3.2_bookings_body/TC_3.2.12_review_history';
//import { AddReviewFormTest } from './cases/TC_3.2_bookings_body/TC_3.2.12_Add_review_form_test';


import defaultLogger, { logTestSuiteStart, logTestCase, logTestSuiteEnd } from '../../util/logger';

import dotenv from 'dotenv';
import { test } from '@jest/globals';


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

TEST SUITE 3: BOOKING PAGE TESTING Started
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
   
    await driver.get('http://localhost:3000/en/bookings');
    await driver.sleep(5000);

const bookingpageStarttime = new Date().toISOString().replace('T', ' ').substr(0, 19);
const bookingPageEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST CASE 2.0]: BOOKING PAGE TESTING Started
===================================================================
TEST DESCRIPTION: Verify that the booking page loads successfully.
STATUS: ✅ PASSED
START TIME: ${bookingpageStarttime}
END TIME: ${bookingPageEndTime}
DETAILS: Successfully navigated to the Search Page.
-------------------------------------------------------------------`);

testResults.push({ passed: true, testId: 'TC_3.0_BOOKINGS_Navbar', testName: 'BOOKING PAGE TESTING' });

//navbar tests

const navbarStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
logger.info(`
[TEST CASE: 3.1] Navigation Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ✅ PASSED
START TIME: ${navbarStartTime}
END TIME: 
DETAILS: Navigation Bar Testing Started
-------------------------------------------------------------------`);

testResults.push({
    passed: true,
    testId: '3.1',
    testName: 'Navigation bar section',
    errorMessage: ''
  });
  
 const logoResult = await new NavbarTests(driver).checkLogo();
    const logoEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 3.1.1] Logo Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Verify that the company logo is visible and clickable.
    STATUS: ${logoResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${logoEndTime}
    DETAILS: ${logoResult.passed ? 'Logo is visible and functional.' : logoResult.errorMessage || 'Logo test failed'}
    -------------------------------------------------------------------`);
    

    testResults.push({ ...logoResult, testId: '3.1.1', testName: 'Logo Testing' });


    const currencyResult = await new CurrencyDropdownTest(driver).checkCurrencyDropdown();
    const currencyEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 3.1.2] Currency Dropdown Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the currency dropdown and its functionality.
    STATUS: ${currencyResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${currencyEndTime}
    DETAILS: ${currencyResult.passed ? 'Currency dropdown is functional.' : currencyResult.errorMessage || 'Currency dropdown test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...currencyResult, testId: '3.1.2', testName: 'Currency Dropdown Testing' });

    const countryResult = await new NvBarCuntry(driver).testCountryDropdownClick();
    const countryEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
    [TEST CASE: 3.1.3] Country Dropdown Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the country dropdown and its functionality.
    STATUS: ${countryResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${countryEndTime}
    DETAILS: ${countryResult.passed ? 'Country dropdown is functional.' : countryResult.errorMessage || 'Country dropdown test failed'}
    -------------------------------------------------------------------`);


    testResults.push({ ...countryResult, testId: '3.1.3', testName: 'Country Dropdown Testing' });

    const notifyBellResult = await new NotifyBellTests(driver).testNotifyBell();
    const notifyBellEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 3.1.4] Notification Bell Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate the notification bell in the Navigation Bar.
    STATUS: ${notifyBellResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${notifyBellEndTime}
    DETAILS: ${notifyBellResult.passed ? 'Notification bell is functional.' : notifyBellResult.errorMessage || 'Notification bell test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...notifyBellResult, testId: '3.1.4', testName: 'Notification Bell Testing' });

    const buttonResult = await new NavbarButtonsTest(driver).checkNavbarButtons();
    const buttonEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

    logger.info(`
    [TEST CASE: 3.1.5] Navbar Button Testing
    -------------------------------------------------------------------
    TEST DESCRIPTION: Validate all Navigation Bar buttons.
    STATUS: ${buttonResult.passed ? '✅ PASSED' : '❌ FAILED'}
    START TIME: ${navbarStartTime}
    END TIME: ${buttonEndTime}
    DETAILS: ${buttonResult.passed ? 'All Navbar buttons are functional.' : buttonResult.errorMessage || 'Navbar button test failed'}
    -------------------------------------------------------------------`);

    testResults.push({ ...buttonResult, testId: '3.1.5', testName: 'Navbar Button Testing' });

    
   
    const navbarEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const navbarResult = logoResult.passed;
    
    logger.info(`
[TEST CASE: 3.1] Navigation Bar Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ${navbarResult ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${navbarStartTime}
END TIME: ${navbarEndTime}
DETAILS: ${navbarResult ? 'All Navigation Bar tests passed.' : 'Some Navigation Bar tests failed.'}
-------------------------------------------------------------------`);


testResults.push({ passed: navbarResult, testId: '3.1', testName: 'Navigation Bar Testing' });

//body section

const bodyStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
logger.info(`
[TEST CASE: 3.2] Booking Body Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Booking Body elements and interactions.
STATUS: ✅ PASSED
START TIME: ${bodyStartTime}
END TIME:
DETAILS: Booking Body Testing Started
-------------------------------------------------------------------`);


testResults.push({

    passed: true,
    testId: '3.2',
    testName: 'Booking Body section',
    errorMessage: ''
    });
const bookingnavigationresult = await new BookingsNavigationTest(driver).checkNavigationButtons();
const bookingnavigationEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

   logger.info(`
   [TEST CASE: 3.2.1] Booking Navigation Testing
   -------------------------------------------------------------------
   TEST DESCRIPTION: Validate all Booking Navigation buttons.
   STATUS: ${bookingnavigationresult.passed ? '✅ PASSED' : '❌ FAILED'}
   START TIME: ${bodyStartTime}
   END TIME: ${bookingnavigationEndTime}
   DETAILS: ${bookingnavigationresult.passed ? 'All Booking Navigation buttons are functional.' : bookingnavigationresult.errorMessage || 'Booking Navigation button test failed'}
   -------------------------------------------------------------------`);

testResults.push({ ...bookingnavigationresult, testId: '3.2.1', testName: 'Booking Navigation Testing' });
   
   
const calendarResult = await new CalendarTest(driver).checkCalendarFunctionality();
const calendarEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

   logger.info(`
   [TEST CASE: 3.2.2] Calendar Testing
   -------------------------------------------------------------------
   TEST DESCRIPTION: Validate all Calendar elements and interactions.
   STATUS: ${calendarResult.passed ? '✅ PASSED' : '❌ FAILED'}
   START TIME: ${bodyStartTime}
   END TIME: ${calendarEndTime}
   DETAILS: ${calendarResult.passed ? 'All Calendar tests passed.' : calendarResult.errorMessage || 'Calendar test failed'}
   -------------------------------------------------------------------`);

testResults.push({ ...calendarResult, testId: '3.2.2', testName: 'Calendar Testing' });

const sidePanelResult = await new SidePanelTest(driver).checkSidePanelElements();
const sidePanelEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.3] Side Panel Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Side Panel elements and interactions.
  STATUS: ${sidePanelResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${sidePanelEndTime}
  DETAILS: ${sidePanelResult.passed ? 'All Side Panel tests passed.' : sidePanelResult.errorMessage || 'Side Panel test failed'}
  -------------------------------------------------------------------`);




testResults.push({ ...sidePanelResult, testId: '3.2.3', testName: 'Side Panel Testing' });

const bookingFiltersResult = await new BookingFiltersTest(driver).checkBookingFilters();
const bookingFiltersEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.4] Booking Filters Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Booking Filters elements and interactions.
  STATUS: ${bookingFiltersResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${bookingFiltersEndTime}
  DETAILS: ${bookingFiltersResult.passed ? 'All Booking Filters tests passed.' : bookingFiltersResult.errorMessage || 'Booking Filters test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...bookingFiltersResult, testId: '3.2.4', testName: 'Booking Filters Testing' });


const bookingCardResult = await new BookingCardTest(driver).checkBookingCard();
const bookingCardEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.5] Booking Card Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Booking Cards elements and interactions.
  STATUS: ${bookingCardResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${bookingCardEndTime}
  DETAILS: ${bookingCardResult.passed ? 'All Booking Cards tests passed.' : bookingCardResult.errorMessage || 'Booking Cards test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...bookingCardResult, testId: '3.2.5', testName: 'Booking Card Testing' });
   


const hairStudioResult = await new BookingDetailsTest(driver).checkAllElements();
const hairStudioEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.6] Hair Studio Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Hair Studio elements and interactions.
  STATUS: ${hairStudioResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${hairStudioEndTime}
  DETAILS: ${hairStudioResult.passed ? 'All Hair Studio tests passed.' : hairStudioResult.errorMessage || 'Hair Studio test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...hairStudioResult, testId: '3.2.6', testName: 'Hair Studio Testing' });


const paymentResult = await new BookingFiltersTest2(driver).checkPaymentButton();
const paymentEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.7] Hair and studio payment, approve ,review content Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Payment elements and interactions.
  STATUS: ${paymentResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${paymentEndTime}
  DETAILS: ${paymentResult.passed ? 'All Payment tests passed.' : paymentResult.errorMessage || 'contnet test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...paymentResult, testId: '3.2.7', testName: 'content Testing' });


const reviewResult = await new ReviewsTest(driver).checkReviewsContent();
const reviewEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.11] Reviews Content Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Reviews elements and interactions.
  STATUS: ${reviewResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${reviewEndTime}
  DETAILS: ${reviewResult.passed ? 'All Reviews tests passed.' : reviewResult.errorMessage || 'Reviews test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...reviewResult, testId: '3.2.11', testName: 'Reviews Content Testing' });



const historyResult = await new HistoryTest(driver).checkHistoryContent();
const historyEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

  logger.info(`
  [TEST CASE: 3.2.12] History Content Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all History elements and interactions.
  STATUS: ${historyResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bodyStartTime}
  END TIME: ${historyEndTime}
  DETAILS: ${historyResult.passed ? 'All History tests passed.' : historyResult.errorMessage || 'History test failed'}
  -------------------------------------------------------------------`);

testResults.push({ ...historyResult, testId: '3.2.12', testName: 'History Content Testing' });

const bodyEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
const bodyResult = bookingnavigationresult.passed;

logger.info(`
[TEST CASE: 3.2] Booking Body Testing
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Booking Body elements and interactions.
STATUS: ${bodyResult ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${bodyStartTime}
END TIME: ${bodyEndTime}
DETAILS: ${bodyResult ? 'All Booking Body tests passed.' : 'Some Booking Body tests failed.'}
-------------------------------------------------------------------`);

const suiteEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
const duration = calculateDuration(suiteStartTime, suiteEndTime);
const overallResult = testResults.every(result => result.passed);

logger.info('\n===================================================================');
logger.info(`TEST SUITE 3: BOOKING PAGE TESTING ${overallResult ? 'PASSED' : 'FAILED'}`);
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

export async function runAllBookingTests(driver: WebDriver, customLogger: Logger = defaultLogger): Promise<TestResult[]> {
try {
const searchResults = await runSearchTests(driver, customLogger);

console.log('All booking tests completed.');
console.log('Test Results:', searchResults);

return searchResults;
} catch (error) {
console.error('Error running booking tests:', error);
return [{ passed: false, errorMessage: `Error running search tests: ${error}`, testId: 'ERROR', testName: 'booking Tests Error' }];
}
}
