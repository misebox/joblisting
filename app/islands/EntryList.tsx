import type { Entry, Tag } from '@/db';
import SortableHeader from '@/islands/SortableHeader';

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
    const params = new URLSearchParams(window.location.search);
    
    // If clicking on the same column, toggle order
    if (params.get('sort') === column || (column === 'updatedAt' && !params.get('sort'))) {
      const newOrder = params.get('order') === 'asc' ? 'desc' : 'asc';
      params.set('order', newOrder);
    } else {
      // If clicking on a new column, set to desc
      params.set('order', 'desc');
    }
    
    params.set('sort', column);
    window.location.href = `/?${params.toString()}`;
  };
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: '新規',
      reviewed: '確認済み',
      rejected: '却下'
    };
    return labels[status] || status;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: '2-digit',
      day: '2-digit'
    });
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
            <SortableHeader column="requirements" label="必須スキル" currentSort={currentSort} currentOrder={currentOrder} onSort={handleSort} />
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
                {truncateText(entry.description, 60)}
              </td>
              <td title={entry.requirements || undefined}>
                {truncateText(entry.requirements, 50)}
              </td>
              <td>
                <div className="tags">
                  {entry.tags?.slice(0, 4).map(tag => (
                    <span key={tag.id} className={`tag tag-${tag.category}`}>
                      {tag.name}
                    </span>
                  )) || '-'}
                  {(entry.tags?.length || 0) > 4 && (
                    <span className="tag-more">+{(entry.tags?.length || 0) - 4}</span>
                  )}
                </div>
              </td>
              <td>
                <span className={`status status-${entry.status}`}>
                  {getStatusLabel(entry.status)}
                </span>
              </td>
              <td>{formatDate(entry.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}