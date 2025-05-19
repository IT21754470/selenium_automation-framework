interface TestStats {
    totalSteps: number;
    passedTests: number;
    failedTests: Array<{
      section: string;
      subsection: string;
      error: string;
    }>;
  }
  
  export class TestStatsTracker {
    private static instance: TestStatsTracker;
    private stats: TestStats = {
      totalSteps: 0,
      passedTests: 0,
      failedTests: [],
    };
  
    private constructor() {}
  
    public static getInstance(): TestStatsTracker {
      if (!TestStatsTracker.instance) {
        TestStatsTracker.instance = new TestStatsTracker();
      }
      return TestStatsTracker.instance;
    }
  
    incrementSteps(count: number = 1) {
      this.stats.totalSteps += count;
    }
  
    incrementPassedTests(count: number = 1) {
      this.stats.passedTests += count;
    }
  
    addFailedTest(section: string, subsection: string, error: string) {
      this.stats.failedTests.push({ section, subsection, error });
    }
  
    getStats(): TestStats {
      return { ...this.stats };
    }
  
    reset() {
      this.stats = {
        totalSteps: 0,
        passedTests: 0,
        failedTests: [],
      };
    }
  }
  
  