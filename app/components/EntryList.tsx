import type { Entry } from '@/db';

interface Props {
  entries: Entry[];
}

export default function EntryList({ entries }: Props) {
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
    <table className="dense-table">
      <thead>
        <tr>
          <th>案件</th>
          <th>会社</th>
          <th>単価</th>
          <th>場所</th>
          <th>期間</th>
          <th>概要</th>
          <th>必須スキル</th>
          <th>状態</th>
          <th>更新</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <tr key={entry.id}>
            <td>
              <div className="title-cell">
                <a href={`/entry/${entry.id}`} className="title-link">
                  {truncateText(entry.title, 30)}
                </a>
                {entry.starred && <span className="starred">★</span>}
              </div>
            </td>
            <td title={entry.company || undefined}>
              {truncateText(entry.company, 15)}
            </td>
            <td title={entry.price || undefined}>
              {truncateText(entry.price, 12)}
            </td>
            <td title={entry.location || undefined}>
              {truncateText(entry.location, 15)}
            </td>
            <td title={entry.period || undefined}>
              {truncateText(entry.period, 10)}
            </td>
            <td title={entry.description || undefined}>
              {truncateText(entry.description, 40)}
            </td>
            <td title={entry.requirements || undefined}>
              {truncateText(entry.requirements, 30)}
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
  );
}