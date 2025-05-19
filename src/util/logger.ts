import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Directories for logs and summaries
const logDirectory = path.join(__dirname, '../../output/default');
const summaryDirectory = path.join(__dirname, '../../output/report');

// Ensure directories exist
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(summaryDirectory)) {
  fs.mkdirSync(summaryDirectory, { recursive: true });
}

// Generate the next log file name
const getNextLogFileName = () => {
  const logFiles = fs.readdirSync(logDirectory);
  const logPrefix = 'bookme-frontend-consumer-id-';
  let nextFileId = 1;

  logFiles.forEach((file) => {
    if (file.startsWith(logPrefix)) {
      const match = file.match(/id-(\d+)-/);
      if (match && match[1]) {
        const fileNumber = parseInt(match[1], 10);
        nextFileId = Math.max(nextFileId, fileNumber + 1);
      }
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(logDirectory, `${logPrefix}${nextFileId}-${timestamp}.log`);
};

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.printf(({ message }: winston.Logform.TransformableInfo) => message as string),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: getNextLogFileName() }),
  ],
});

export interface TestResult {
  passed: boolean;
  errorMessage?: string;
  testId: string;
  testName: string;
}

// Log test suite start
export const logTestSuiteStart = (suiteName: string, startTime: string) => {
  logger.info(`

================================================================================================
[TEST SUITE: ${suiteName}] ${suiteName} Testing Started
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all ${suiteName} elements and interactions.
STATUS: ✅ STARTED
START TIME: ${startTime}
DETAILS: ${suiteName} Testing Initialized
===================================================================`);
};

export const logTestSectionStart = (
  testId: string,
  sectionName: string,
  description: string,
  startTime: string
) => {
  logger.info(`

[TEST CASE: ${testId}] ${sectionName} started
-------------------------------------------------------------------
TEST DESCRIPTION: ${description}
STATUS: ✅ STARTED
START TIME: ${startTime}
DETAILS: ${sectionName} Testing Started
-------------------------------------------------------------------`);
};

// Log individual test cases
export const logTestCase = (
  testId: string,
  testName: string,
  description: string,
  status: 'PASSED' | 'FAILED' | 'STARTED',
  startTime: string,
  endTime: string | null,
  details: string,
  indent: number = 0
) => {
  const indentation = '    '.repeat(indent);
  const statusSymbol = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '✅ STARTED';
  logger.info(`

  ${indentation}[TEST CASE: ${testId}] ${testName}
  ${indentation}-------------------------------------------------------------------
  ${indentation}TEST DESCRIPTION: ${description}
  ${indentation}STATUS: ${statusSymbol}
  ${indentation}START TIME: ${startTime}
  ${indentation}${endTime ? `END TIME: ${endTime}` : ''}
  ${indentation}DETAILS: ${details}
  ${indentation}-------------------------------------------------------------------`);
};

//section end
export const logTestSectionEnd = (
  testId: string,
  sectionName: string,
  description: string,
  status: 'PASSED' | 'FAILED',
  startTime: string,
  endTime: string,
  details: string
) => {
  const statusSymbol = status === 'PASSED' ? '✅' : '❌';
  logger.info(`

[TEST CASE: ${testId}] ${sectionName} ended
-------------------------------------------------------------------
TEST DESCRIPTION: ${description}
STATUS: ${statusSymbol} ${status}
START TIME: ${startTime}
END TIME: ${endTime}
DETAILS: ${details}
-------------------------------------------------------------------`);
};

// Log test suite end
export const logTestSuiteEnd = (
  suiteName: string,
  status: 'PASSED' | 'FAILED',
  startTime: string,
  endTime: string,
  duration: string,
  details: string
) => {
  const statusSymbol = status === 'PASSED' ? '✅' : '❌';
  logger.info(`

[TEST SUITE: ${suiteName}] ${suiteName} Testing Completed
-------------------------------------------------------------------
TEST DESCRIPTION: Validate all ${suiteName} elements and interactions.
STATUS: ${statusSymbol} ${status}
START TIME: ${startTime}
END TIME: ${endTime}
TOTAL DURATION: ${duration}
DETAILS: ${details}
===================================================================

================================================================================================
${endTime} INFO: QA Logs Completed for Project: ${suiteName}
================================================================================================`);
};

// Update summary file
export const updateSummaryFile = (
  homeTestResults: TestResult[] | null,
  searchTestResults: TestResult[] | null,
  bookingsTestResults: TestResult[] | null,
  startTime: string,
  endTime: string,
  duration: string
) => {
  const summaryFilePath = path.join(summaryDirectory, 'summary.log');

  const createSummary = (results: TestResult[], name: string, suiteNumber: string) => {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed);

    let summary = `
------------------------------------------------------------------------------------    
TEST SUITE ${suiteNumber}: ${name.toUpperCase()} PAGE TESTING Overview
------------------------------------------------------------------------------------
- Total Steps Executed: ${totalTests}
- Total Tests ✅ PASSED: ${passedTests}
- Total Tests ❌ FAILED: ${failedTests.length}
`;

    if (failedTests.length > 0) {
      summary += '\n';
      const groupedFailures: { [key: string]: TestResult[] } = {};
      failedTests.forEach(test => {
        const parentTestId = test.testId.split('.').slice(0, -1).join('.');
        if (!groupedFailures[parentTestId]) {
          groupedFailures[parentTestId] = [];
        }
        groupedFailures[parentTestId].push(test);
      });

      Object.entries(groupedFailures).forEach(([parentTestId, failures]) => {
        const parentTest = results.find(r => r.testId === parentTestId);
        summary += `     - ${endTime} INFO: [TEST CASE: ${parentTestId}] ${parentTest?.testName || 'Unknown Test'} Testing FAILED.\n`;
        failures.forEach(failure => {
          summary += `           - ${endTime} INFO: [TEST CASE: ${failure.testId}] ${failure.errorMessage}\n`;
        });
      });
    }

    return summary;
  };

  let summaryContent = `
======================================================================================================
${endTime} INFO: Final Summary for Project: Bookmei.com Frontend Consumer Web App
======================================================================================================
`;

  if (homeTestResults) {
    summaryContent += createSummary(homeTestResults, 'HOME', '1');
  }

  if (searchTestResults) {
    summaryContent += createSummary(searchTestResults, 'SEARCH', '2');
  }

  if (bookingsTestResults) {
    summaryContent += createSummary(bookingsTestResults, 'BOOKINGS', '3');
  }

  summaryContent += `
------------------------------------------------------------------------------------

======================================================================================================
OVERALL TEST RESULTS:
------------------------------------------------------------------------------------
Total Test Suites: ${homeTestResults && searchTestResults && bookingsTestResults ? '3' : homeTestResults && searchTestResults ? '2' : '1'}
Total Steps Executed: ${(homeTestResults?.length || 0) + (searchTestResults?.length || 0) + (bookingsTestResults?.length || 0)}
Total Tests ✅ PASSED: ${(homeTestResults?.filter(r => r.passed).length || 0) + (searchTestResults?.filter(r => r.passed).length || 0) + (bookingsTestResults?.filter(r => r.passed).length || 0)}
Total Tests ❌ FAILED: ${(homeTestResults?.filter(r => !r.passed).length || 0) + (searchTestResults?.filter(r => !r.passed).length || 0) + (bookingsTestResults?.filter(r => !r.passed).length || 0)}
Overall Status: ${(homeTestResults?.every(r => r.passed) ?? true) && (searchTestResults?.every(r => r.passed) ?? true) && (bookingsTestResults?.every(r => r.passed) ?? true) ? '✅ PASSED' : '❌ FAILED'}
Total Duration: ${duration}
======================================================================================================
${endTime} INFO: Testing Suite Completed for Project: Bookmei.com Frontend Consumer Web App
======================================================================================================`;

  try {
    fs.writeFileSync(summaryFilePath, summaryContent);
    logger.info(`Summary file updated successfully at ${summaryFilePath}`);
  } catch (error) {
    logger.error(`Error updating summary file: ${error}`);
  }
};

export default logger;

