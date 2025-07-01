import { createRoute } from 'honox/factory';
import { db, entries, tags, entryTags } from '@/db';
import { eq, desc, asc, or, ilike, and } from 'drizzle-orm';
import EntryList from '@/islands/EntryList';
import AutoSubmitForm from '@/islands/AutoSubmitForm';

export default createRoute(async (c) => {
  const { status, starred, search, sort = 'updatedAt', order = 'desc' } = c.req.query();
  console.log('Query params:', { status, starred, search, sort, order });

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
        ilike(entries.title, `%${search}%`),
        ilike(entries.company, `%${search}%`),
        ilike(entries.description, `%${search}%`)
      )
    );
  }

  // Determine sort column
  const sortColumn = sort === 'updatedAt' ? entries.updatedAt :
                    sort === 'createdAt' ? entries.createdAt :
                    sort === 'title' ? entries.title :
                    sort === 'company' ? entries.company :
                    sort === 'price' ? entries.price :
                    sort === 'location' ? entries.location :
                    sort === 'period' ? entries.period :
                    sort === 'description' ? entries.description :
                    sort === 'requirements' ? entries.requirements :
                    sort === 'status' ? entries.status :
                    entries.updatedAt;
  
  // Execute query
  const allEntries = await db
    .select()
    .from(entries)
    .where(conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined)
    .orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

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
        key={`${status}-${starred}-${search}-${sort}-${order}`}
        status={status || 'all'} 
        starred={starred || ''} 
        search={search || ''} 
        sort={sort || 'updatedAt'}
        order={order || 'desc'}
      />
      
      <EntryList 
        entries={entriesWithTags} 
        currentSort={sort}
        currentOrder={order}
      />
    </>
  );
});