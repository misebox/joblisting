import SelectBox from './SelectBox';
import SearchInput from '@/islands/SearchInput';

interface Props {
  status?: string;
  starred?: string;
  search?: string;
}

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'new', label: '新規' },
  { value: 'reviewed', label: '確認済み' },
  { value: 'rejected', label: '却下' }
];

const starredOptions = [
  { value: '', label: 'すべて' },
  { value: 'true', label: 'スター付きのみ' }
];

export default function FilterForm({ status = 'all', starred = '', search = '' }: Props) {
  return (
    <div className="filters">
      <form method="get" action="/">
        <div className="filter-group">
          <label htmlFor="status">ステータス</label>
          <SelectBox 
            name="status"
            id="status"
            value={status}
            options={statusOptions}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="starred">スター</label>
          <SelectBox 
            name="starred"
            id="starred"
            value={starred}
            options={starredOptions}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="search">検索</label>
          <SearchInput initialValue={search} />
        </div>
        
        <button type="submit">検索</button>
      </form>
    </div>
  );
}