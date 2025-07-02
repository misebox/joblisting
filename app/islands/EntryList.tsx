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

// Column configuration - add/remove keys here to show/hide columns
const VISIBLE_COLUMNS = [
  'title',
  'company',
  'starred',
  'price',
  'location',
  'period',
  // 'description', // 概要を除外
  'comment',
  'tags',
  'status',
  'updatedAt'
] as const;

type ColumnKey = typeof VISIBLE_COLUMNS[number] | 'description';

const COLUMN_CONFIG: Record<ColumnKey, {
  label: string;
  sortable: boolean;
  render: (entry: EntryWithTags, truncateText: (text: string | null, maxLength: number) => string) => any;
}> = {
  title: {
    label: '案件',
    sortable: true,
    render: (entry) => (
      <div className="title-cell">
        <a href={`/entry/${entry.id}`} className="title-link">
          {entry.title ? entry.title.substring(0, 40) + (entry.title.length > 40 ? '...' : '') : '-'}
        </a>
      </div>
    )
  },
  company: {
    label: '会社',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.company || undefined}>{truncate(entry.company, 20)}</span>
    )
  },
  starred: {
    label: 'スター',
    sortable: true,
    render: (entry) => (
      <span className="star-cell">{entry.starred ? '⭐' : ''}</span>
    )
  },
  price: {
    label: '単価',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.price || undefined}>{truncate(entry.price, 15)}</span>
    )
  },
  location: {
    label: '場所',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.location || undefined}>{truncate(entry.location, 20)}</span>
    )
  },
  period: {
    label: '期間',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.period || undefined}>{truncate(entry.period, 15)}</span>
    )
  },
  description: {
    label: '概要',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.description || undefined}>{truncate(entry.description, 90)}</span>
    )
  },
  comment: {
    label: 'コメント',
    sortable: true,
    render: (entry, truncate) => (
      <span title={entry.comment || undefined} className="comment-cell">{truncate(entry.comment, 50)}</span>
    )
  },
  tags: {
    label: 'タグ',
    sortable: false,
    render: (entry) => <TagList tags={entry.tags} />
  },
  status: {
    label: '状態',
    sortable: true,
    render: (entry) => <StatusBadge status={entry.status} />
  },
  updatedAt: {
    label: '更新',
    sortable: true,
    render: (entry) => formatDate(entry.updatedAt)
  }
};

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
              {VISIBLE_COLUMNS.map(columnKey => {
                const config = COLUMN_CONFIG[columnKey];
                return config.sortable ? (
                  <SortableHeader 
                    key={columnKey}
                    column={columnKey} 
                    label={config.label} 
                    currentSort={currentSort} 
                    currentOrder={currentOrder} 
                    onSort={handleSort} 
                  />
                ) : (
                  <th key={columnKey}>{config.label}</th>
                );
              })}
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
                {VISIBLE_COLUMNS.map(columnKey => {
                  const config = COLUMN_CONFIG[columnKey];
                  return (
                    <td key={columnKey}>
                      {config.render(entry, truncateText)}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}