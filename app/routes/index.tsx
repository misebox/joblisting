import { createRoute } from 'honox/factory';
import { db, entries } from '@/db';
import { eq, desc, or, like } from 'drizzle-orm';
import EntryList from '../components/EntryList';
import FilterForm from '../islands/FilterForm';

export default createRoute(async (c) => {
  const { status, starred, search } = c.req.query();

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

  return c.render(
    <>
      <h1>案件一覧</h1>
      
      <FilterForm 
        status={status} 
        starred={starred} 
        search={search} 
      />
      
      <EntryList entries={allEntries} />
    </>,
    { title: '案件一覧 - Job Parser' }
  );
});