import { useState } from 'hono/jsx';
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
  // 制御されたコンポーネントとして状態を管理
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentStarred, setCurrentStarred] = useState(starred);
  const [currentSearch, setCurrentSearch] = useState(search);

  const handleStatusChange = (event: Event) => {
    const newValue = (event.target as HTMLSelectElement).value;
    setCurrentStatus(newValue);
    submitForm();
  };

  const handleStarredChange = (event: Event) => {
    const newValue = (event.target as HTMLSelectElement).value;
    setCurrentStarred(newValue);
    submitForm();
  };

  const handleSearchChange = (event: Event) => {
    const newValue = (event.target as HTMLInputElement).value;
    setCurrentSearch(newValue);
    submitForm();
  };

  const submitForm = () => {
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.submit();
      }
    }, 100);
  };

  return (
    <div className="filters">
      <form method="get" action="/">
        <div className="filter-group">
          <label htmlFor="status">ステータス</label>
          <SelectBox 
            name="status"
            id="status"
            value={currentStatus}
            options={statusOptions}
            onChange={handleStatusChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="starred">スター</label>
          <SelectBox 
            name="starred"
            id="starred"
            value={currentStarred}
            options={starredOptions}
            onChange={handleStarredChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="search">検索</label>
          <SearchInput 
            initialValue={currentSearch} 
            onChange={handleSearchChange} 
          />
        </div>
        
        <button type="submit">検索</button>
      </form>
    </div>
  );
}
