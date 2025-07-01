import { createRoute } from 'honox/factory';
import { JobListingParser } from '@/parser';
import { db, entries } from '@/db';
import { TechTagger } from '@/parser/tagger';
import { generateEntryHashSync } from '@/utils/hash';
import { and, eq } from 'drizzle-orm';

export const POST = createRoute(async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    if (!file.name.endsWith('.txt')) {
      return c.json({ success: false, error: 'Only .txt files are supported' }, 400);
    }

    // Read file content
    const text = await file.text();
    
    // Parse the file
    const parser = new JobListingParser();
    const parsed = parser.parse(text);
    
    if (!parsed.success) {
      return c.json({ 
        success: false, 
        error: 'Failed to parse file', 
        details: parsed.errors 
      }, 400);
    }

    // Initialize tagger
    const tagger = new TechTagger();
    
    // Process each entry
    const results = [];
    for (const entry of parsed.entries) {
      try {
        // Generate hash for the entry
        const entryHash = generateEntryHashSync(entry);
        
        // Check if entry with same title and hash already exists
        const existingEntry = await db
          .select({ id: entries.id, title: entries.title })
          .from(entries)
          .where(and(
            eq(entries.title, entry.title || ''),
            eq(entries.hash, entryHash)
          ))
          .limit(1);

        if (existingEntry.length > 0) {
          // Update existing entry
          await db
            .update(entries)
            .set({
              ...entry,
              hash: entryHash,
              updatedAt: new Date()
            })
            .where(eq(entries.id, existingEntry[0].id));

          results.push({
            id: existingEntry[0].id,
            title: existingEntry[0].title,
            company: entry.company || 'Unknown',
            status: 'updated'
          });
        } else {
          // Tag the entry
          const tags = tagger.extractTags(entry);
          
          // Insert new entry into database
          const [inserted] = await db.insert(entries).values({
            ...entry,
            hash: entryHash,
            status: 'new',
            starred: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning({ id: entries.id, title: entries.title, company: entries.company });
          
          // Insert tags for this entry
          if (tags.length > 0) {
            const { entryTags } = await import('@/db');
            await db.insert(entryTags).values(
              tags.map(tag => ({
                entryId: inserted.id,
                tagId: tag.id
              }))
            );
          }
          
          results.push({
            id: inserted.id,
            title: inserted.title,
            company: inserted.company,
            status: 'created'
          });
        }
      } catch (error) {
        console.error('Error processing entry:', error);
        results.push({
          title: entry.title || 'Unknown',
          company: entry.company || 'Unknown',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const createdCount = results.filter(r => r.status === 'created').length;
    const updatedCount = results.filter(r => r.status === 'updated').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    let message = '';
    if (createdCount > 0 && updatedCount > 0) {
      message = `${createdCount}件の新規案件を追加、${updatedCount}件の既存案件を更新しました`;
    } else if (createdCount > 0) {
      message = `${createdCount}件の案件を新規追加しました`;
    } else if (updatedCount > 0) {
      message = `${updatedCount}件の既存案件を更新しました`;
    } else {
      message = '処理対象の案件がありませんでした';
    }
    
    if (errorCount > 0) {
      message += ` (${errorCount}件のエラー)`;
    }

    return c.json({
      success: true,
      message,
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    return c.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});