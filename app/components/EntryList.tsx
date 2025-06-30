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
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (entries.length === 0) {
    return <p style={{ textAlign: 'center', padding: '40px' }}>該当する案件が見つかりません</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>タイトル</th>
          <th>会社</th>
          <th>ステータス</th>
          <th>スター</th>
          <th>更新日時</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <tr key={entry.id}>
            <td><a href={`/entry/${entry.id}`}>{entry.title}</a></td>
            <td>{entry.company || '-'}</td>
            <td>
              <span className={`status status-${entry.status}`}>
                {getStatusLabel(entry.status)}
              </span>
            </td>
            <td>{entry.starred ? <span className="starred">★</span> : '-'}</td>
            <td>{formatDate(entry.updatedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}