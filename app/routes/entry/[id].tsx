import { createRoute } from 'honox/factory';
import { db, entries } from '@/app/db';
import { eq } from 'drizzle-orm';
import EntryDetail from '../../components/EntryDetail';
import EntryActions from '../../islands/EntryActions';

export default createRoute(async (c) => {
  const id = parseInt(c.req.param('id'));
  
  const [entry] = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);

  if (!entry) {
    return c.notFound();
  }

  return c.render(
    <>
      <a href="/" className="back-link">← 一覧に戻る</a>
      
      <div className="detail-container">
        <EntryDetail entry={entry} />
        <EntryActions 
          entryId={entry.id}
          initialStatus={entry.status}
          initialComment={entry.comment || ''}
          initialStarred={entry.starred}
        />
      </div>
    </>,
    { title: `${entry.title} - Job Parser` }
  );
});