import type { Entry, Tag } from '@/db';
import SortableHeader from '@/islands/SortableHeader';
import StatusBadge from '@/components/StatusBadge';
import TagList from '@/components/TagList';
import { formatDate } from '@/utils/formatting';
import { navigateWithUpdatedSort } from '@/utils/navigation';

interface EntryWithTags extends Entry {
  tags?: Tag[];
}

interface Props {
  entries: EntryWithTags[];
  currentSort?: string;
  currentOrder?: string;
}

export default function EntryList({ entries, currentSort = 'updatedAt', currentOrder = 'desc' }: Props) {
  const handleSort = (column: string) => {
    navigateWithUpdatedSort(column, currentSort, currentOrder);
  };


  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (entries.length === 0) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>該当する案件が見つかりません</p>;
  }

  return (
    <div className="table-container">
      <table className="dense-table">
        <thead>
          <tr>
            <SortableHeader column="title" label="案件" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="company" label="会社" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="price" label="単価" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="location" label="場所" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="period" label="期間" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="description" label="概要" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <th>タグ</th>
            <SortableHeader column="status" label="状態" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
            <SortableHeader column="updatedAt" label="更新" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id}>
              <td>
                <div className="title-cell">
                  <a href={`/entry/${entry.id}`} className="title-link">
                    {truncateText(entry.title, 40)}
                  </a>
                  {entry.starred && <span className="starred">★</span>}
                </div>
              </td>
              <td title={entry.company || undefined}>
                {truncateText(entry.company, 20)}
              </td>
              <td title={entry.price || undefined}>
                {truncateText(entry.price, 15)}
              </td>
              <td title={entry.location || undefined}>
                {truncateText(entry.location, 20)}
              </td>
              <td title={entry.period || undefined}>
                {truncateText(entry.period, 15)}
              </td>
              <td title={entry.description || undefined}>
                {truncateText(entry.description, 90)}
              </td>
              <td>
                <TagList tags={entry.tags} />
              </td>
              <td>
                <StatusBadge status={entry.status} />
              </td>
              <td>{formatDate(entry.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}