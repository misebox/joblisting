import { useState } from 'hono/jsx';
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isOperating, setIsOperating] = useState(false);

  const handleSort = (column: string) => {
    navigateWithUpdatedSort(column, currentSort, currentOrder);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(entries.map(e => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkOperation = async (operation: 'delete' | 'star' | 'unstar') => {
    if (selectedIds.size === 0) return;
    
    setIsOperating(true);
    try {
      const ids = Array.from(selectedIds);
      const response = await fetch('/api/entries/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, ids })
      });

      if (!response.ok) {
        throw new Error('Bulk operation failed');
      }

      // Refresh page to show changes
      window.location.reload();
    } catch (error) {
      console.error('Bulk operation error:', error);
      alert('一括操作に失敗しました');
    } finally {
      setIsOperating(false);
    }
  };


  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  if (entries.length === 0) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>該当する案件が見つかりません</p>;
  }

  return (
    <div className="table-wrapper">
      {/* Bulk Operation Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bulk-toolbar">
          <span className="selected-count">{selectedIds.size}件選択中</span>
          <div className="bulk-actions">
            <button 
              onClick={() => handleBulkOperation('star')}
              disabled={isOperating}
              className="bulk-button star"
            >
              ⭐ スターを付ける
            </button>
            <button 
              onClick={() => handleBulkOperation('unstar')}
              disabled={isOperating}
              className="bulk-button unstar"
            >
              ☆ スターを外す
            </button>
            <button 
              onClick={() => {
                if (confirm(`${selectedIds.size}件の案件を削除しますか？`)) {
                  handleBulkOperation('delete');
                }
              }}
              disabled={isOperating}
              className="bulk-button delete"
            >
              🗑️ 削除
            </button>
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table className="dense-table">
          <thead>
            <tr>
              <th className="checkbox-column">
                <input 
                  type="checkbox"
                  checked={entries.length > 0 && selectedIds.size === entries.length}
                  onChange={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                />
              </th>
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
                <td className="checkbox-column">
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(entry.id)}
                    onChange={(e) => handleSelectOne(entry.id, (e.target as HTMLInputElement).checked)}
                  />
                </td>
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
    </div>
  );
}