import { Builder, WebDriver } from 'selenium-webdriver';
import * as fs from 'fs';
import * as path from 'path';
import logger, { logTestSuiteStart, logTestSuiteEnd, updateSummaryFile, TestResult } from './util/logger';
import { runNavbarTests } from './pages/home/cases/TC_1.2_main__Test';
import { runAllSearchTests } from './pages/search/TC_2.0_Search_main';
import { runAllBookingTests } from './pages/bookings/TC_3.0_bookings_main';

class LogCollector {
  private logs: string[] = [];

  addLog(message: string) {
    this.logs.push(message);
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }
}

const homeLogCollector = new LogCollector();
const searchLogCollector = new LogCollector();
const bookingLogCollector = new LogCollector();

const createLogWrapper = (collector: LogCollector) => ({
  info: (message: string) => {
    collector.addLog(message);
  },
  error: (message: string) => {
    collector.addLog(`ERROR: ${message}`);
  }
});

async function runTests(pageName: string, logCollector: LogCollector, driver: WebDriver): Promise<TestResult[]> {
  try {
    let rawResults: any[];

    const wrappedLogger = createLogWrapper(logCollector);

    switch (pageName.toLowerCase()) {
      case 'home':
        await driver.get('http://localhost:3000');
        rawResults = await runNavbarTests(driver, wrappedLogger);
        break;
      case 'search':
        await driver.get('http://localhost:3000/search');
        rawResults = await runAllSearchTests(driver, wrappedLogger);
        break;
      case 'booking':
        await driver.get('http://localhost:3000/bookings');
        rawResults = await runAllBookingTests(driver, wrappedLogger);
        break;
      default:
        throw new Error(`Unknown page name: ${pageName}`);
    }

    const testResults: TestResult[] = rawResults.map(result => ({
      passed: 'passed' in result ? result.passed : false,
      errorMessage: result.errorMessage || undefined,
      testId: result.testId || 'unknown',
      testName: result.testName || 'Unknown Test'
    }));

    return testResults;
  } catch (error) {
    logCollector.addLog(`Error during ${pageName} page testing: ${error}`);
    return [{
      passed: false,
      errorMessage: `Error during ${pageName} page testing: ${error}`,
      testId: 'ERROR',
      testName: 'Unknown Test'
    }];
  }
}

async function runParallelTests(): Promise<void> {
  const suiteStartTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  homeLogCollector.clear();
  searchLogCollector.clear();
  bookingLogCollector.clear();

  let homeDriver: WebDriver | null = null;
  let searchDriver: WebDriver | null = null;
  let bookingDriver: WebDriver | null = null;

  try {
    // Create separate WebDriver instances for each test suite
    [homeDriver, searchDriver, bookingDriver] = await Promise.all([
      new Builder().forBrowser('chrome').build(),
      new Builder().forBrowser('chrome').build(),
      new Builder().forBrowser('chrome').build()
    ]);

    // Run tests in parallel with separate drivers
    const [homeResults, searchResults, bookingResults] = await Promise.all([
      runTests('home', homeLogCollector, homeDriver),
      runTests('search', searchLogCollector, searchDriver),
      runTests('booking', bookingLogCollector, bookingDriver)
    ]);

    logTestSuiteStart('BOOKMEI.COM - FRONTEND CONSUMER WEB APP', suiteStartTime);

    logger.info('\n===================================================================');
    logger.info('TEST SUITE 1: HOME PAGE TESTING Results');
    logger.info('===================================================================\n');
    homeLogCollector.getLogs().forEach(log => logger.info(log));

    logger.info('\n===================================================================');
    logger.info('TEST SUITE 2: SEARCH PAGE TESTING Results');
    logger.info('===================================================================\n');
    searchLogCollector.getLogs().forEach(log => logger.info(log));

    logger.info('\n===================================================================');
    logger.info('TEST SUITE 3: BOOKING PAGE TESTING Results');
    logger.info('===================================================================\n');
    bookingLogCollector.getLogs().forEach(log => logger.info(log));

    const suiteEndTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    const duration = calculateDuration(suiteStartTime, suiteEndTime);

    updateSummaryFile(homeResults, searchResults, bookingResults, suiteStartTime, suiteEndTime, duration);

    const allResults = [...homeResults, ...searchResults, ...bookingResults];
    const overallResult = allResults.every(r => r.passed);
    logTestSuiteEnd('BOOKMEI.COM - FRONTEND CONSUMER WEB APP', overallResult ? 'PASSED' : 'FAILED', suiteStartTime, suiteEndTime, duration, allResults.length.toString());
  } finally {
    // Ensure all drivers are quit
    await Promise.all([
      homeDriver?.quit(),
      searchDriver?.quit(),
      bookingDriver?.quit()
    ]);
  }
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);
  return `${durationSeconds} SECONDS`;
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'parallel') {
    await runParallelTests();
  } else if (command === 'home' || command === 'search' || command === 'booking') {
    const collector = new LogCollector();
    const startTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
    let driver: WebDriver | null = null;
    try {
      driver = await new Builder().forBrowser('chrome').build();
      const results = await runTests(command, collector, driver);
      const endTime = new Date().toISOString().replace('T', ' ').substr(0, 19);
      const duration = calculateDuration(startTime, endTime);
      collector.getLogs().forEach(log => logger.info(log));
      
      if (command === 'home') {
        updateSummaryFile(results, null, null, startTime, endTime, duration);
      } else if (command === 'search') {
        updateSummaryFile(null, results, null, startTime, endTime, duration);
      } else {
        updateSummaryFile(null, null, results, startTime, endTime, duration);
      }
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  } else {
    console.error('Please provide a valid command: "parallel", "home", "booking", or "search"');
    process.exit(1);
  }
}

main().catch(error => {
  logger.error(`Test process failed: ${error}`);
});
