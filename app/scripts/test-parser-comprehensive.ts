import { JobListingParser } from '../parser';
import { testCases, errorTestCases, multiBlockTestCase } from '../tests/parser-test-cases';

function runTests() {
  const parser = new JobListingParser();
  let passed = 0;
  let failed = 0;

  console.log('🧪 Running comprehensive parser tests...\n');

  // Test individual cases
  console.log('=== Testing Valid Cases ===');
  for (const testCase of testCases) {
    try {
      const result = parser.parse(testCase.input);
      
      if (result.errors.length > 0) {
        console.log(`❌ ${testCase.name}: Unexpected parsing errors`);
        result.errors.forEach(error => {
          console.log(`   Error: ${error.type} - ${error.detail}`);
        });
        failed++;
        continue;
      }

      if (result.entries.length !== 1) {
        console.log(`❌ ${testCase.name}: Expected 1 entry, got ${result.entries.length}`);
        failed++;
        continue;
      }

      const entry = result.entries[0];
      let testPassed = true;

      // Check expected fields
      for (const [key, expectedValue] of Object.entries(testCase.expected)) {
        const actualValue = entry[key as keyof typeof entry];
        if (actualValue !== expectedValue) {
          console.log(`❌ ${testCase.name}: Field '${key}' mismatch`);
          console.log(`   Expected: "${expectedValue}"`);
          console.log(`   Actual: "${actualValue}"`);
          testPassed = false;
        }
      }

      if (testPassed) {
        console.log(`✅ ${testCase.name}`);
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Exception thrown - ${error}`);
      failed++;
    }
  }

  // Test error cases
  console.log('\n=== Testing Error Cases ===');
  for (const testCase of errorTestCases) {
    try {
      const result = parser.parse(testCase.input);
      
      if (result.errors.length === 0) {
        console.log(`❌ ${testCase.name}: Expected error but parsing succeeded`);
        failed++;
        continue;
      }

      const hasExpectedError = result.errors.some(error => error.type === testCase.expectedError);
      if (hasExpectedError) {
        console.log(`✅ ${testCase.name}`);
        passed++;
      } else {
        console.log(`❌ ${testCase.name}: Expected ${testCase.expectedError}, got ${result.errors.map(e => e.type).join(', ')}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: Exception thrown - ${error}`);
      failed++;
    }
  }

  // Test multi-block case
  console.log('\n=== Testing Multi-Block Parsing ===');
  try {
    const result = parser.parse(multiBlockTestCase.input);
    
    if (result.entries.length === multiBlockTestCase.expectedCount) {
      console.log(`✅ ${multiBlockTestCase.name}: Parsed ${result.entries.length} entries`);
      
      // Check titles
      const actualTitles = result.entries.map(e => e.title);
      const titlesMatch = JSON.stringify(actualTitles) === JSON.stringify(multiBlockTestCase.expectedTitles);
      
      if (titlesMatch) {
        console.log(`✅ ${multiBlockTestCase.name}: All titles match expected values`);
        passed++;
      } else {
        console.log(`❌ ${multiBlockTestCase.name}: Titles mismatch`);
        console.log(`   Expected: ${JSON.stringify(multiBlockTestCase.expectedTitles)}`);
        console.log(`   Actual: ${JSON.stringify(actualTitles)}`);
        failed++;
      }
    } else {
      console.log(`❌ ${multiBlockTestCase.name}: Expected ${multiBlockTestCase.expectedCount} entries, got ${result.entries.length}`);
      failed++;
    }

    if (result.errors.length > 0) {
      console.log(`   Note: ${result.errors.length} parsing errors occurred`);
    }
  } catch (error) {
    console.log(`❌ ${multiBlockTestCase.name}: Exception thrown - ${error}`);
    failed++;
  }

  // Test edge cases
  console.log('\n=== Testing Edge Cases ===');
  
  // Empty input
  try {
    const result = parser.parse('');
    if (result.entries.length === 0 && result.errors.length === 0) {
      console.log('✅ Empty input handling');
      passed++;
    } else {
      console.log(`❌ Empty input: Expected 0 entries/errors, got ${result.entries.length}/${result.errors.length}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Empty input: Exception thrown - ${error}`);
    failed++;
  }

  // Whitespace-only input
  try {
    const result = parser.parse('   \n\n   ');
    if (result.entries.length === 0 && result.errors.length === 0) {
      console.log('✅ Whitespace-only input handling');
      passed++;
    } else {
      console.log(`❌ Whitespace-only: Expected 0 entries/errors, got ${result.entries.length}/${result.errors.length}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Whitespace-only: Exception thrown - ${error}`);
    failed++;
  }

  // Only separator
  try {
    const result = parser.parse('**************************************');
    if (result.entries.length === 0 && result.errors.length === 0) {
      console.log('✅ Separator-only input handling');
      passed++;
    } else {
      console.log(`❌ Separator-only: Expected 0 entries/errors, got ${result.entries.length}/${result.errors.length}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ Separator-only: Exception thrown - ${error}`);
    failed++;
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n💥 Some tests failed. Check the output above for details.');
  }
  
  return failed === 0;
}

// Run the tests
const success = runTests();
process.exit(success ? 0 : 1);