import { createRoute } from 'honox/factory';
import { db, entries, tags, entryTags } from '@/db';
import { eq, desc, or, like } from 'drizzle-orm';
import EntryList from '@/components/EntryList';
import AutoSubmitForm from '@/islands/AutoSubmitForm';

export default createRoute(async (c) => {
  const { status, starred, search } = c.req.query();
  console.log('Query params:', { status, starred, search });

  // Build query with filters
  const conditions = [];
  
  if (status && status !== 'all') {
    conditions.push(eq(entries.status, status as 'new' | 'reviewed' | 'rejected'));
  }
  
  if (starred === 'true') {
    conditions.push(eq(entries.starred, true));
  }
  
  if (search) {
    conditions.push(
      or(
        like(entries.title, `%${search}%`),
        like(entries.company, `%${search}%`),
        like(entries.description, `%${search}%`)
      )
    );
  }

  // Execute query
  const allEntries = await db
    .select()
    .from(entries)
    .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : or(...conditions)) : undefined)
    .orderBy(desc(entries.updatedAt));

  // Get tags for each entry
  const entriesWithTags = await Promise.all(
    allEntries.map(async (entry) => {
      const entryTagsList = await db
        .select({ tag: tags })
        .from(entryTags)
        .leftJoin(tags, eq(entryTags.tagId, tags.id))
        .where(eq(entryTags.entryId, entry.id));
      
      return {
        ...entry,
        tags: entryTagsList.map(et => et.tag).filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      };
    })
  );

  return c.render(
    <>
      <h1>案件一覧</h1>

      <AutoSubmitForm 
        key={`${status}-${starred}-${search}`}
        status={status || 'all'} 
        starred={starred || ''} 
        search={search || ''} 
      />
      
      <EntryList entries={entriesWithTags} />
    </>
  );
});