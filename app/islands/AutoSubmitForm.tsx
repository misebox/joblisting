import SelectBox from '@/islands/SelectBox';
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

export default function AutoSubmitForm({ status = 'all', starred = '', search = '' }: Props) {
  const handleChange = (event: Event) => {
    const form = (event.target as HTMLSelectElement).form;
    if (form) {
      form.submit();
    }
  };

  return (
    <div className="filters">
      <form method="get" action="/">
        <div className="filter-group">
          <label htmlFor="status">ステータス</label>
          <SelectBox 
            key={`status-${status}`}
            name="status"
            id="status"
            defaultValue={status}
            options={statusOptions}
            onChange={handleChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="starred">スター</label>
          <SelectBox 
            key={`starred-${starred}`}
            name="starred"
            id="starred"
            defaultValue={starred}
            options={starredOptions}
            onChange={handleChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="search">検索</label>
          <SearchInput 
            initialValue={search} 
          />
        </div>
        
        <button type="submit">検索</button>
      </form>
    </div>
  );
}
