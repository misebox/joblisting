import { useState } from 'hono/jsx';

interface Props {
  status?: string;
  starred?: string;
  search?: string;
}

export default function FilterForm({ status = '', starred = '', search = '' }: Props) {
  const [searchInput, setSearchInput] = useState(search);

  return (
    <div className="filters">
      <form method="get" action="/">
        <div className="filter-group">
          <label htmlFor="status">ステータス</label>
          <select name="status" id="status" defaultValue={status}>
            <option value="">すべて</option>
            <option value="new">新規</option>
            <option value="reviewed">確認済み</option>
            <option value="rejected">却下</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="starred">スター</label>
          <select name="starred" id="starred" defaultValue={starred}>
            <option value="">すべて</option>
            <option value="true">スター付きのみ</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="search">検索</label>
          <input 
            type="text" 
            name="search" 
            id="search" 
            placeholder="タイトル、会社名など" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        <button type="submit">検索</button>
      </form>
    </div>
  );
}