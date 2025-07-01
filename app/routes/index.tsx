import { createRoute } from 'honox/factory';
import { db, entries, tags, entryTags } from '@/db';
import { eq, desc, asc, or, ilike, and, inArray, count, sql } from 'drizzle-orm';
import EntryList from '@/islands/EntryList';
import AutoSubmitForm from '@/islands/AutoSubmitForm';

export default createRoute(async (c) => {
  const { status, starred, search, sort = 'updatedAt', order = 'desc', tags: selectedTags } = c.req.query();
  console.log('Query params:', { status, starred, search, sort, order, selectedTags });

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

  // タグフィルタリング
  if (selectedTags) {
    const tagNames = selectedTags.split(',').filter(tag => tag.trim() !== '');
    if (tagNames.length > 0) {
      // 選択されたタグ名からタグIDを取得
      const selectedTagRecords = await db
        .select()
        .from(tags)
        .where(inArray(tags.name, tagNames));
      
      const selectedTagIds = selectedTagRecords.map(tag => tag.id);
      
      if (selectedTagIds.length > 0) {
        // AND条件：すべてのタグを持つエントリのIDを取得
        // GROUP BYとHAVINGを使って効率的に実装
        const entriesWithAllTags = await db
          .select({ 
            entryId: entryTags.entryId,
            tagCount: count(entryTags.tagId).as('tag_count')
          })
          .from(entryTags)
          .where(inArray(entryTags.tagId, selectedTagIds))
          .groupBy(entryTags.entryId)
          .having(sql`COUNT(DISTINCT ${entryTags.tagId}) = ${selectedTagIds.length}`);
        
        const entryIds = entriesWithAllTags.map(et => et.entryId);
        
        if (entryIds.length > 0) {
          conditions.push(inArray(entries.id, entryIds));
        } else {
          // 該当するエントリがない場合は結果を空にする
          conditions.push(eq(entries.id, -1));
        }
      }
    }
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

  // 利用可能なタグ一覧を取得
  const availableTags = await db
    .select()
    .from(tags)
    .orderBy(tags.category, tags.name);

  return c.render(
    <>
      <h1>案件一覧</h1>

      <AutoSubmitForm 
        key={`${status}-${starred}-${search}-${sort}-${order}-${selectedTags}`}
        status={status || 'all'} 
        starred={starred || ''} 
        search={search || ''} 
        sort={sort || 'updatedAt'}
        order={order || 'desc'}
        selectedTags={selectedTags}
        availableTags={availableTags}
      />
      
      <EntryList 
        entries={entriesWithTags} 
        currentSort={sort}
        currentOrder={order}
      />
    </>
  );
});