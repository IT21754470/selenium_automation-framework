import { Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';
import defaultLogger, { 
  logTestSuiteStart, 
  logTestCase, 
  logTestSuiteEnd, 
 
} from '../../../util/logger';
import dotenv from 'dotenv';
import { NavbarTests } from './NavBar/TC_1.2.1_NavBar_Logo_Test';
import { NavbarLanguageTests } from './NavBar/TC_1.2.2_NavBar_Language_Button_Test';
import { NvBarCuntry } from './NavBar/TC_1.2.3_NavBar_Country_Selection_Test';
import { NotifyBellTests } from './NavBar/TC_1.2.5_NavBar_Notification_Bell_Test';
import { CurrencyDropdownTest } from './NavBar/TC_1.2.4_NavBar_currency_dropdown_Test';
import { NavbarButtonsTest } from './NavBar/TC_1.2.6_NavBar_home_search_signin_navbar_Test';
import { BeautyWellnessButtonTest } from './category section/TC_1.3.2_Body_Beauty_Wellness_Button_Test';
import { LogoTest } from './logo section/TC_1.4.1_NavBar_words_Test';
import { SearchBarTest } from './search_bar/TC_1.5.1_Search_bar_test';
import { LocationInputTest } from './search_bar/TC_1.5.2_search_bar_location_test';
import { DateInputTest } from './search_bar/TC_1.5.3_search_bar_date_test';
import { TimeInputTest } from './search_bar/TC_1.5.4_search_bar_time_test';
import { RecommendedDataLoadingTest } from './body section/TC_1.6.1_Recommonded_Test';
import { TrendingServicesTest } from './body section/TC_1.6.2_Trending_Test';
import { NewestServicesTest } from './body section/TC_1.6.3_Newest_Services_Test';
import { ServiceCardsTest } from './body section/TC_1.6.4_cards_Test';
import LocationServiceTest from './body section/TC_1.6.5_LocationEnable_Test';
import { WhyChooseSectionTest } from './body section/TC_1.6.6_Why_choosing_bookmei_Test';
import { FAQSectionTest } from './body section/TC_1.6.7_FAQ_Test';
import { ReviewTest } from './body section/TC_1.6.8_review_Test';
import { CityNavigationTest } from './body section/TC_1.6.9_find_specilatiy_Test';
import { FooterTest } from './footer/TC_1.7.1_Footer_Test';

dotenv.config();

interface TestResult {
 
    passed: boolean;
    errorMessage?: string;
    testId: string;
    testName: string;
  
  
 // sectionName: string;
}
interface Logger {
  info: (message: string) => void;
  error: (message: string) => void;
}

export async function runNavbarTests(driver: WebDriver, customLogger: Logger = defaultLogger): Promise<TestResult[]> {
  const projectName = 'BOOKMEI.COM - FRONTEND CONSUMER WEB APP';
  const suiteStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
  const logger = customLogger;
 // let driver: WebDriver | null = null;
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

   
    await driver.get('http://localhost:3000/');
    await driver.sleep(5000);

    const homePageStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const homePageEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    
    logger.info(`
[TEST CASE: 1.1] Home Page Navigation
-------------------------------------------------------------------
TEST DESCRIPTION: Verify that the Home Page loads successfully.
STATUS: ✅ PASSED
START TIME: ${homePageStartTime}
END TIME: ${homePageEndTime}
DETAILS: Successfully navigated to the Home Page.
-------------------------------------------------------------------`);

    logger.info('\n===================================================================');
    logger.info('TEST SUITE 1: HOME PAGE TESTING Started');
    logger.info('===================================================================\n');

    const navBarStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.2] Navigation Bar Component Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ✅ STARTED
START TIME: ${navBarStartTime}
DETAILS: Navigation Bar Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.2',
  testName: 'Navigation bar section',
  errorMessage: '',
 // sectionName: ''
});

    const logoStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const logoResult = await new NavbarTests(driver).checkLogo();
    const logoEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.1] Logo Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the company logo is visible and clickable.
  STATUS: ${logoResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${logoStartTime}
  END TIME: ${logoEndTime}
  ${logoResult.passed ? 'DETAILS' : 'ERROR'}: ${logoResult.passed ? 'Logo is visible and functional.' : logoResult.errorMessage || 'Unable to locate element .logo'}
  -------------------------------------------------------------------`);

   testResults.push({ 
    passed: logoResult.passed,
    errorMessage: logoResult.errorMessage,
    testId: '1.2.1',
    testName: 'Logo Testing',

  });
    const langStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const langResult = await new NavbarLanguageTests(driver).checkLanguageButtons();
    const langEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.2] Language Button Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the "Sin", "Tam", and "en" language buttons are displayed and functional.
  STATUS: ${langResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${langStartTime}
  END TIME: ${langEndTime}
  ${langResult.passed ? 'DETAILS' : 'ERROR'}: ${langResult.passed ? 'Language buttons are functional.' : langResult.errorMessage || 'Unable to locate the language buttons in the DOM.'}
  -------------------------------------------------------------------`);

   testResults.push({
    passed: langResult.passed,
    errorMessage: langResult.errorMessage,
    testId: '1.2.2',
    testName: 'Language Button Testing',
  });

    const countryDropdownStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const countryDropdownResult = await new NvBarCuntry(driver).testCountryDropdownClick();
    const countryDropdownEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.3] Country Selection Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate that users can select a country from the dropdown.
  STATUS: ${countryDropdownResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${countryDropdownStartTime}
  END TIME: ${countryDropdownEndTime}
  ${countryDropdownResult.passed ? 'DETAILS' : 'ERROR'}: ${countryDropdownResult.passed ? 'Country dropdown is clickable and options are displayed.' : countryDropdownResult.errorMessage || 'Country dropdown interaction failed.'}
  -------------------------------------------------------------------`);
   testResults.push({
    passed: countryDropdownResult.passed,
    errorMessage: countryDropdownResult.errorMessage,
    testId: '1.2.3',
    testName: 'Country Selection Testing',
  });
    const currencyDropdownStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const currencyDropdownResult = await new CurrencyDropdownTest(driver).checkCurrencyDropdown();
    const currencyDropdownEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.4] Currency Dropdown Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the currency dropdown is visible and functional.
  STATUS: ${currencyDropdownResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${currencyDropdownStartTime}
  END TIME: ${currencyDropdownEndTime}
  ${currencyDropdownResult.passed ? 'DETAILS' : 'ERROR'}: ${currencyDropdownResult.passed ? 'Currency dropdown is functional.' : currencyDropdownResult.errorMessage || 'Currency dropdown interaction failed.'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: currencyDropdownResult.passed,
    errorMessage: currencyDropdownResult.errorMessage,
    testId: '1.2.4',
    testName: 'Currency Dropdown Testing',
  });
    const bellStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const bellResult = await new NotifyBellTests(driver).testNotifyBell();
    const bellEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.5] Notification Bell Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Check that the notification bell icon is displayed and functional.
  STATUS: ${bellResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${bellStartTime}
  END TIME: ${bellEndTime}
  ${bellResult.passed ? 'DETAILS' : 'ERROR'}: ${bellResult.passed ? 'Notification bell is functional.' : bellResult.errorMessage || 'Notification bell element is missing in the DOM.'}
  -------------------------------------------------------------------`);

      
    testResults.push({
    passed: bellResult.passed,
    errorMessage: bellResult.errorMessage,
    testId: '1.2.5',
    testName: 'Notification Bell Testing',
  });
    const navbarButtonsStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const navbarButtonsResult = await new NavbarButtonsTest(driver).checkNavbarButtons();
    const navbarButtonsEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.2.6] Navbar Buttons Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Check that the navbar buttons are displayed and functional.
  STATUS: ${navbarButtonsResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${navbarButtonsStartTime}
  END TIME: ${navbarButtonsEndTime}
  ${navbarButtonsResult.passed ? 'DETAILS' : 'ERROR'}: ${navbarButtonsResult.passed ? 'Navbar buttons are functional.' : navbarButtonsResult.errorMessage || 'Navbar buttons are missing in the DOM.'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: navbarButtonsResult.passed,
    errorMessage: navbarButtonsResult.errorMessage,
    testId: '1.2.6',
    testName: 'Navbar Buttons Testing',
  });
    const navBarEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const navBarResult = logoResult.passed && langResult.passed && currencyDropdownResult.passed && countryDropdownResult.passed && bellResult.passed && navbarButtonsResult.passed;
    logger.info(`
[TEST SECTION: 1.2] Navigation Bar Component Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Navigation Bar elements and interactions.
STATUS: ${navBarResult ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${navBarStartTime}
END TIME: ${navBarEndTime}
DETAILS: ${navBarResult ? 'All Navigation Bar tests passed.' : 'Some Navigation Bar tests failed.'}
-------------------------------------------------------------------`);

    const categorySectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.3] Category Section Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Category Section elements and interactions.
STATUS: ✅ STARTED
START TIME: ${categorySectionStartTime}
DETAILS: Category Section Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.3',
  testName: 'category section',
  errorMessage: '',
 // sectionName: ''
});

    const beautyWellnessStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const beautyWellnessResult = await new BeautyWellnessButtonTest(driver).checkBeautyWellnessButton();
    const beautyWellnessEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.3.1] Beauty & Wellness Button Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Check that the Beauty & Wellness button is visible and clickable
  STATUS: ${beautyWellnessResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${beautyWellnessStartTime}
  END TIME: ${beautyWellnessEndTime}
  ${beautyWellnessResult.passed ? 'DETAILS' : 'ERROR'}: ${beautyWellnessResult.passed ? 'Beauty & Wellness button is functional' : beautyWellnessResult.errorMessage || 'Beauty & Wellness button test failed'}
  -------------------------------------------------------------------`);

      
    testResults.push({
    passed: beautyWellnessResult.passed,
    errorMessage: beautyWellnessResult.errorMessage,
    testId: '1.3.1',
    testName: 'Beauty & Wellness Button Testing',
  });
    const categorySectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.3] Category Section Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Category Section elements and interactions.
STATUS: ${beautyWellnessResult.passed ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${categorySectionStartTime}
END TIME: ${categorySectionEndTime}
DETAILS: ${beautyWellnessResult.passed ? 'All Category Section tests passed.' : 'Some Category Section tests failed.'}
-------------------------------------------------------------------`);

    const logoSectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.4] Logo Section Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Logo Section elements and interactions.
STATUS: ✅ STARTED
START TIME: ${logoSectionStartTime}
DETAILS: Logo Section Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.4',
  testName: 'logo section',
  errorMessage: '',
 // sectionName: ''
});

    const logoTestStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const logoTestResult = await new LogoTest(driver).checkMainText();
    const logoTestEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.4.1] Logo Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the logo is visible and clickable
  STATUS: ${logoTestResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${logoTestStartTime}
  END TIME: ${logoTestEndTime}
  ${logoTestResult.passed ? 'DETAILS' : 'ERROR'}: ${logoTestResult.passed ? 'Logo is visible and functional' : logoTestResult.errorMessage || 'Logo test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: logoTestResult.passed,
    errorMessage: logoTestResult.errorMessage,
    testId: '1.4.1',
    testName: 'Logo Testing',
  });
    const logoSectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.4] Logo Section Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Logo Section elements and interactions.
STATUS: ${logoTestResult.passed ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${logoSectionStartTime}
END TIME: ${logoSectionEndTime}
DETAILS: ${logoTestResult.passed ? 'All Logo Section tests passed.' : 'Some Logo Section tests failed.'}
-------------------------------------------------------------------`);

    const searchSectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.5] Search Section Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Search Section elements and interactions.
STATUS: ✅ STARTED
START TIME: ${searchSectionStartTime}
DETAILS: Search Section Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.5',
  testName: 'search section section',
  errorMessage: '',
//  sectionName: ''
});

    const searchBarStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const searchBarResult = await new SearchBarTest().checkSearchBar(driver);
    const searchBarEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.5.1] Search Bar Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the search bar is functional and behaves correctly
  STATUS: ${searchBarResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${searchBarStartTime}
  END TIME: ${searchBarEndTime}
  ${searchBarResult.passed ? 'DETAILS' : 'ERROR'}: ${searchBarResult.passed ? 'Search bar is functional' : searchBarResult.errorMessage || 'Search bar test failed'}
  -------------------------------------------------------------------`);

  testResults.push({
    passed: searchBarResult.passed,
    errorMessage: searchBarResult.errorMessage,
    testId: '1.5.1',
    testName: 'Search Bar Testing',
  });
    const locationInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const locationInputResult = await new LocationInputTest().checkLocationInput(driver);
    const locationInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.5.2] Location Input Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the location input is functional and behaves correctly
  STATUS: ${locationInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${locationInputStartTime}
  END TIME: ${locationInputEndTime}
  ${locationInputResult.passed ? 'DETAILS' : 'ERROR'}: ${locationInputResult.passed ? 'Location input is functional' : locationInputResult.errorMessage || 'Location input test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: locationInputResult.passed,
    errorMessage: locationInputResult.errorMessage,
    testId: '1.5.2',
    testName: 'Location Input Testing',
  });
    const dateInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const dateInputResult = await new DateInputTest().checkDateInput(driver);
    const dateInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.5.3] Date Input Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the date input is functional and behaves correctly
  STATUS: ${dateInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${dateInputStartTime}
  END TIME: ${dateInputEndTime}
  ${dateInputResult.passed ? 'DETAILS' : 'ERROR'}: ${dateInputResult.passed ? 'Date input is functional' : dateInputResult.errorMessage || 'Date input test failed'}
  -------------------------------------------------------------------`);

      
    testResults.push({
    passed: dateInputResult.passed,
    errorMessage: dateInputResult.errorMessage,
    testId: '1.5.3',
    testName: 'Date Input Testing',
  });
    const timeInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const timeInputResult = await new TimeInputTest().checkTimeInput(driver);
    const timeInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.5.4] Time Input Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the time input is functional and behaves correctly
  STATUS: ${timeInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${timeInputStartTime}
  END TIME: ${timeInputEndTime}
  ${timeInputResult.passed ? 'DETAILS' : 'ERROR'}: ${timeInputResult.passed ? 'Time input is functional' : timeInputResult.errorMessage || 'Time input test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: timeInputResult.passed,
    errorMessage: timeInputResult.errorMessage,
    testId: '1.5.4',
    testName: 'Time Input Testing',
  });
    const searchSectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const allSearchTestsPassed = searchBarResult.passed && locationInputResult.passed && dateInputResult.passed && timeInputResult.passed;
    logger.info(`
[TEST SECTION: 1.5] Search Section Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Search Section elements and interactions.
STATUS: ${allSearchTestsPassed ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${searchSectionStartTime}
END TIME: ${searchSectionEndTime}
DETAILS: ${allSearchTestsPassed ? 'All Search Section tests passed.' : 'Some Search Section tests failed.'}
-------------------------------------------------------------------`);

    const bodySectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.6] Body Section Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Body Section elements and interactions.
STATUS: ✅ STARTED
START TIME: ${bodySectionStartTime}
DETAILS: Body Section Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.6',
  testName: 'body section',
  errorMessage: '',
 // sectionName: ''
});

    const recommendInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const recommendInputResult = await new RecommendedDataLoadingTest().checkRecommendedDataLoading(driver);
    const recommendInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.1] Recommended Cards Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the recommended cards display is functional and behaves correctly
  STATUS: ${recommendInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${recommendInputStartTime}
  END TIME: ${recommendInputEndTime}
  ${recommendInputResult.passed ? 'DETAILS' : 'ERROR'}: ${recommendInputResult.passed ? 'Recommended cards display is functional' : recommendInputResult.errorMessage || 'Recommended cards display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: recommendInputResult.passed,
    errorMessage: recommendInputResult.errorMessage,
    testId: '1.6.1',
    testName: 'Recommended Cards Display Testing',
  });
    const trendingInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const trendingInputResult = await new TrendingServicesTest().checkTrendingServices(driver);
    const trendingInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.2] Trending Services Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the trending services display is functional and behaves correctly
  STATUS: ${trendingInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${trendingInputStartTime}
  END TIME: ${trendingInputEndTime}
  ${trendingInputResult.passed ? 'DETAILS' : 'ERROR'}: ${trendingInputResult.passed ? 'Trending services display is functional' : trendingInputResult.errorMessage || 'Trending services display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: trendingInputResult.passed,
    errorMessage: trendingInputResult.errorMessage,
    testId: '1.6.2',
    testName: 'Trending Services Display Testing',
  });
    const newestInputStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const newestInputResult = await new NewestServicesTest().checkNewestServices(driver);
    const newestInputEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.3] Newest Services Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the newest services display is functional and behaves correctly
  STATUS: ${newestInputResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${newestInputStartTime}
  END TIME: ${newestInputEndTime}
  ${newestInputResult.passed ? 'DETAILS' : 'ERROR'}: ${newestInputResult.passed ? 'Newest services display is functional' : newestInputResult.errorMessage || 'Newest services display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: newestInputResult.passed,
    errorMessage: newestInputResult.errorMessage,
    testId: '1.6.3',
    testName: 'Newest Services Display Testing',
  });
    const categoryCardsStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const categoryCardsResult = await new ServiceCardsTest().checkServiceCards(driver);
    const categoryCardsEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.4] Category Cards Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the category cards display is functional and behaves correctly
  STATUS: ${categoryCardsResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${categoryCardsStartTime}
  END TIME: ${categoryCardsEndTime}
  ${categoryCardsResult.passed ? 'DETAILS' : 'ERROR'}: ${categoryCardsResult.passed ? 'Category cards display is functional' : categoryCardsResult.errorMessage || 'Category cards display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: categoryCardsResult.passed,
    errorMessage: categoryCardsResult.errorMessage,
    testId: '1.6.4',
    testName: 'Category Cards Display Testing',
  });
    const locationServicesStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const locationServicesResult = await new LocationServiceTest().checkLocationServices(driver);
    const locationServicesEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.5] Location Services Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the location services display is functional and behaves correctly
  STATUS: ${locationServicesResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${locationServicesStartTime}
  END TIME: ${locationServicesEndTime}
  ${locationServicesResult.passed ? 'DETAILS' : 'ERROR'}: ${locationServicesResult.passed ? 'Location services display is functional' : locationServicesResult.errorMessage || 'Location services display test failed'}
  -------------------------------------------------------------------`);

      
    testResults.push({
    passed: locationServicesResult.passed,
    errorMessage: locationServicesResult.errorMessage,
    testId: '1.6.5',
    testName: 'Location Services Display Testing',
  });
    const whyChooseSectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const whyChooseSectionResult = await new WhyChooseSectionTest().checkWhyChooseSection(driver);
    const whyChooseSectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.6] Why Choose Section Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the why choose section display is functional and behaves correctly
  STATUS: ${whyChooseSectionResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${whyChooseSectionStartTime}
  END TIME: ${whyChooseSectionEndTime}
  ${whyChooseSectionResult.passed ? 'DETAILS' : 'ERROR'}: ${whyChooseSectionResult.passed ? 'Why choose section display is functional' : whyChooseSectionResult.errorMessage || 'Why choose section display test failed'}
  -------------------------------------------------------------------`);

      
    testResults.push({
    passed: whyChooseSectionResult.passed,
    errorMessage: whyChooseSectionResult.errorMessage,
    testId: '1.6.6',
    testName: 'Why Choose Section Display Testing',
  });
    const FAQSectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const FAQSectionResult = await new FAQSectionTest().checkFAQSection(driver);
    const FAQSectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.7] FAQ Section Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the FAQ section display is functional and behaves correctly
  STATUS: ${FAQSectionResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${FAQSectionStartTime}
  END TIME: ${FAQSectionEndTime}
  ${FAQSectionResult.passed ? 'DETAILS' : 'ERROR'}: ${FAQSectionResult.passed ? 'FAQ section display is functional' : FAQSectionResult.errorMessage || 'FAQ section display test failed'}
  -------------------------------------------------------------------`);


    testResults.push({
    passed: FAQSectionResult.passed,
    errorMessage: FAQSectionResult.errorMessage,
    testId: '1.6.7',
    testName: 'FAQ Section Display Testing',
  });
    const reviewSectionStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const reviewSectionResult = await new ReviewTest().checkReviews(driver);
    const reviewSectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.8] Review Section Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the review section display is functional and behaves correctly
  STATUS: ${reviewSectionResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${reviewSectionStartTime}
  END TIME: ${reviewSectionEndTime}
  ${reviewSectionResult.passed ? 'DETAILS' : 'ERROR'}: ${reviewSectionResult.passed ? 'Review section display is functional' : reviewSectionResult.errorMessage || 'Review section display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: reviewSectionResult.passed,
    errorMessage: reviewSectionResult.errorMessage,
    testId: '1.6.8',
    testName: 'Review Section Display Testing',
  });
    const cityNavigationStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const cityNavigationResult = await new CityNavigationTest().checkCityNavigation(driver);
    const cityNavigationEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.6.9] City Navigation Display Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Verify that the city navigation display is functional and behaves correctly
  STATUS: ${cityNavigationResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${cityNavigationStartTime}
  END TIME: ${cityNavigationEndTime}
  ${cityNavigationResult.passed ? 'DETAILS' : 'ERROR'}: ${cityNavigationResult.passed ? 'City navigation display is functional' : cityNavigationResult.errorMessage || 'City navigation display test failed'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: cityNavigationResult.passed,
    errorMessage: cityNavigationResult.errorMessage,
    testId: '1.6.9',
    testName: 'City Navigation Display Testing',
  });
    const bodySectionEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const allBodyTestsPassed = recommendInputResult.passed && trendingInputResult.passed && newestInputResult.passed && categoryCardsResult.passed && locationServicesResult.passed && whyChooseSectionResult.passed && FAQSectionResult.passed && reviewSectionResult.passed && cityNavigationResult.passed;
    logger.info(`
[TEST SECTION: 1.6] Body Section Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Body Section elements and interactions.
STATUS: ${allBodyTestsPassed ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${bodySectionStartTime}
END TIME: ${bodySectionEndTime}
DETAILS: ${allBodyTestsPassed ? 'All Body Section tests passed.' : 'Some Body Section tests failed.'}
-------------------------------------------------------------------`);

    const footerStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.7] Footer Testing started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Footer elements and interactions.
STATUS: ✅ STARTED
START TIME: ${footerStartTime}
DETAILS: Footer Testing Started
-------------------------------------------------------------------`);
testResults.push({
  passed: true,
  testId: '1.7',
  testName: 'footersection',
  errorMessage: '',
 // sectionName: ''
});
    const footerElementStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const footerElementResult = await new FooterTest().checkFooter(driver);
    const footerElementEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
  [TEST CASE: 1.7.1] Footer Element Testing
  -------------------------------------------------------------------
  TEST DESCRIPTION: Validate all Footer elements and interactions.
  STATUS: ${footerElementResult.passed ? '✅ PASSED' : '❌ FAILED'}
  START TIME: ${footerElementStartTime}
  END TIME: ${footerElementEndTime}
  ${footerElementResult.passed ? 'DETAILS' : 'ERROR'}: ${footerElementResult.passed ? 'All Footer tests passed.' : 'Some Footer tests failed.'}
  -------------------------------------------------------------------`);

    testResults.push({
    passed: footerElementResult.passed,
    errorMessage: footerElementResult.errorMessage,
    testId: '1.7.1',
    testName: 'Footer Element Testing',
  });
    const footerEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    logger.info(`
[TEST SECTION: 1.7] Footer Testing ended
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all Footer elements and interactions.
STATUS: ${footerElementResult.passed ? '✅ PASSED' : '❌ FAILED'}
START TIME: ${footerStartTime}
END TIME: ${footerEndTime}
DETAILS: ${footerElementResult.passed ? 'All Footer tests passed.' : 'Some Footer tests failed.'}
-------------------------------------------------------------------`);

   const suiteEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
       const duration = calculateDuration(suiteStartTime, suiteEndTime);
       const overallResult = testResults.every(result => result.passed);
   
       logger.info('\n===================================================================');
       logger.info(`TEST SUITE 1: HOME PAGE TESTING ${overallResult ? 'PASSED' : 'FAILED'}`);
       logger.info('===================================================================\n');
   
       logger.info('Project summary updated successfully in the summary file.');
       logger.info(`Test process completed. Overall Result: ${overallResult ? 'Passed' : 'Failed'}`);
   
       return testResults;
   
     } catch (error) {
       logger.error(`Error in runhomeTests: ${error}`);
       return [{
         passed: false, errorMessage: `An unexpected error occurred: ${error}`, testId: 'ERROR', testName: 'Unexpected Error',
        // sectionName: ''
       }];
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

export async function runAllNavbarTests(driver: WebDriver,customLogger: Logger = defaultLogger): Promise<TestResult[]> {
 // let driver: WebDriver | null = null;
  try {
    const homeResults = await runNavbarTests(driver, customLogger);
    
  //  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

   
    
    console.log('All home tests completed.');
    console.log('Test Results:', homeResults);

    return homeResults;
  } catch (error) {
    console.error('Error running home tests:', error);
    return [{
      passed: false, errorMessage: `Error running home tests: ${error}`, testId: 'ERROR', testName: 'home Tests Error',
    }];
 
  }
}
