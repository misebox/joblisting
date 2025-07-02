import { db, entries } from '@/db';
import { generateEntryHashSync } from '@/utils/hash';
import { eq } from 'drizzle-orm';

async function backfillHashes() {
  console.log('Starting hash backfill...');
  
  // Get all entries without hashes
  const entriesWithoutHash = await db
    .select()
    .from(entries)
    .where(eq(entries.hash, null));
  
  console.log(`Found ${entriesWithoutHash.length} entries without hashes`);
  
  for (const entry of entriesWithoutHash) {
    const hash = generateEntryHashSync(entry);
    
    await db
      .update(entries)
      .set({ hash })
      .where(eq(entries.id, entry.id));
    
    console.log(`Updated entry ${entry.id}: ${entry.title} -> ${hash}`);
  }
  
  console.log('Hash backfill completed!');
  process.exit(0);
}

backfillHashes().catch((error) => {
  console.error('Error during hash backfill:', error);
  process.exit(1);
});