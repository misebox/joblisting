import { createRoute } from 'honox/factory';
import { JobListingParser } from '@/parser';
import { db, entries } from '@/db';
import { TechTagger } from '@/parser/tagger';

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
        // Tag the entry
        const tags = tagger.extractTags(entry);
        
        // Insert entry into database
        const [inserted] = await db.insert(entries).values({
          ...entry,
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

    return c.json({
      success: true,
      message: `${results.filter(r => r.status === 'created').length} entries imported successfully`,
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