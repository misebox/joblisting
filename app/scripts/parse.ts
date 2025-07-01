import { JobListingParser } from '../parser';
import { db, entries } from '../db';
import { readFile } from 'fs/promises';

async function parseAndInsert(filePath: string) {
  try {
    console.log(`Parsing file: ${filePath}`);
    
    const parser = new JobListingParser();
    const result = await parser.parseFile(filePath);
    
    console.log(`Found ${result.entries.length} entries`);
    console.log(`Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.error('Parse errors:');
      result.errors.forEach(error => {
        console.error(`- Block ${error.blockIndex}: ${error.type} - ${error.detail}`);
      });
    }
    
    if (result.entries.length > 0) {
      console.log('Inserting entries into database...');
      const inserted = await db.insert(entries).values(result.entries).returning();
      console.log(`Successfully inserted ${inserted.length} entries`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npm run parse <file-path>');
  process.exit(1);
}

parseAndInsert(filePath);