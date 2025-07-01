import { TechTagger } from '@/parser/tagger';

async function tagEntries() {
  try {
    console.log('Starting tag extraction for all entries...');
    
    const tagger = new TechTagger();
    await tagger.tagAllEntries();
    
    console.log('✅ Tag extraction completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tag extraction failed:', error);
    process.exit(1);
  }
}

tagEntries();