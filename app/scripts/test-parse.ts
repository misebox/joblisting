import { JobListingParser } from '../parser';

async function testParse() {
  const parser = new JobListingParser();
  
  // Test with the actual file
  const result = await parser.parseFile('./listings/olive_listings_20250630.txt');
  
  console.log(`✅ Successfully parsed ${result.entries.length} entries`);
  console.log(`❌ Parse errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n=== ERRORS ===');
    result.errors.forEach(error => {
      console.log(`Block ${error.blockIndex}: ${error.type}`);
      console.log(`Detail: ${error.detail}`);
      console.log(`Snippet: ${error.rawSnippet.slice(0, 100)}...`);
      console.log('---');
    });
  }
  
  // Show first few parsed entries
  console.log('\n=== SAMPLE ENTRIES ===');
  result.entries.slice(0, 3).forEach((entry, index) => {
    console.log(`\nEntry ${index + 1}:`);
    console.log(`Title: ${entry.title}`);
    console.log(`Company: ${entry.company || 'N/A'}`);
    console.log(`Price: ${entry.price || 'N/A'}`);
    console.log(`Location: ${entry.location || 'N/A'}`);
    console.log(`Description: ${entry.description?.slice(0, 100)}...`);
  });
}

testParse().catch(console.error);
