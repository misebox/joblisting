import { useState } from 'hono/jsx';
import SelectBox from './SelectBox';

interface Props {
  entryId: number;
  initialStatus: string;
  initialComment: string;
  initialStarred: boolean;
}

export default function EntryActions({ 
  entryId, 
  initialStatus, 
  initialComment, 
  initialStarred 
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [comment, setComment] = useState(initialComment);
  const [starred, setStarred] = useState(initialStarred);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, comment, starred }),
      });

      if (response.ok) {
        setMessage('更新しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('エラーが発生しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="actions">
      <h3 style={{ marginBottom: '15px' }}>アクション</h3>
      <form onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="status">ステータス</label>
          <SelectBox
            name="status"
            id="status"
            defaultValue={status}
            options={[
              { value: 'new', label: '新規' },
              { value: 'reviewed', label: '確認済み' },
              { value: 'rejected', label: '却下' }
            ]}
            onChange={(e) => setStatus((e.target as HTMLSelectElement).value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="comment">コメント</label>
          <textarea 
            name="comment" 
            id="comment" 
            placeholder="メモやコメントを入力"
            value={comment}
            onChange={(e) => setComment((e.target as HTMLTextAreaElement).value)}
          />
        </div>
        
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="starred" 
            checked={starred}
            onChange={(e) => setStarred((e.target as HTMLInputElement).checked)}
          />
          <span>スターを付ける</span>
        </label>
        
        <button type="submit" disabled={saving}>
          {saving ? '更新中...' : '更新'}
        </button>
        
        {message && (
          <p style={{ 
            color: message.includes('エラー') ? '#d32f2f' : '#388e3c',
            marginTop: '10px' 
          }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}