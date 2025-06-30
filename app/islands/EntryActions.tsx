import { useState } from 'hono/jsx';

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
          <select 
            name="status" 
            id="status" 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="new">新規</option>
            <option value="reviewed">確認済み</option>
            <option value="rejected">却下</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="comment">コメント</label>
          <textarea 
            name="comment" 
            id="comment" 
            placeholder="メモやコメントを入力"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="starred" 
            checked={starred}
            onChange={(e) => setStarred(e.target.checked)}
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