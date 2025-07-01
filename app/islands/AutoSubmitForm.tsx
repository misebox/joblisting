import { useState, useEffect } from 'hono/jsx';
import SelectBox from '@/islands/SelectBox';
import SearchInput from '@/islands/SearchInput';
import { saveSearchConditions, loadSearchConditions, clearSearchConditions, defaultConditions } from '@/utils/searchStorage';

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
  const [currentConditions, setCurrentConditions] = useState({
    status: status,
    starred: starred,
    search: search
  });

  // Load from localStorage on mount, but prefer URL params if they exist
  useEffect(() => {
    const hasUrlParams = status !== 'all' || starred !== '' || search !== '';
    if (!hasUrlParams) {
      const stored = loadSearchConditions();
      setCurrentConditions(stored);
      // If we have stored conditions, navigate to them
      if (stored.status !== 'all' || stored.starred !== '' || stored.search !== '') {
        const params = new URLSearchParams();
        if (stored.status !== 'all') params.set('status', stored.status);
        if (stored.starred) params.set('starred', stored.starred);
        if (stored.search) params.set('search', stored.search);
        window.location.href = `/?${params.toString()}`;
      }
    } else {
      // Save URL params to localStorage
      saveSearchConditions({ status, starred, search });
    }
  }, []);

  const handleChange = (event: Event) => {
    const form = (event.target as HTMLSelectElement).form;
    if (form) {
      // Save to localStorage before submitting
      const formData = new FormData(form);
      const conditions = {
        status: formData.get('status') as string || 'all',
        starred: formData.get('starred') as string || '',
        search: formData.get('search') as string || ''
      };
      
      // 意味のある検索条件がある場合のみlocalStorageに保存
      if (conditions.status !== 'all' || conditions.starred !== '' || conditions.search !== '') {
        saveSearchConditions(conditions);
      }
      form.submit();
    }
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // デバッグ用：FormDataの内容を確認
    console.log('FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: "${value}"`);
    }
    
    const conditions = {
      status: formData.get('status') as string || 'all',
      starred: formData.get('starred') as string || '',
      search: formData.get('search') as string || ''
    };
    
    // 意味のある検索条件がある場合のみlocalStorageに保存
    if (conditions.status !== 'all' || conditions.starred !== '' || conditions.search !== '') {
      saveSearchConditions(conditions);
    }
    
    // localStorage保存後に手動でページ遷移
    const params = new URLSearchParams();
    if (conditions.status !== 'all') params.set('status', conditions.status);
    if (conditions.starred) params.set('starred', conditions.starred);
    if (conditions.search) params.set('search', conditions.search);
    window.location.href = `/?${params.toString()}`;
  };

  const handleClear = () => {
    clearSearchConditions();
    window.location.href = '/';
  };

  return (
    <div className="filters">
      <form method="get" action="/" onSubmit={handleSubmit}>
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
            defaultValue={search}
          />
        </div>
        
        <div className="filter-actions">
          <button type="submit">検索</button>
          <button type="button" onClick={handleClear} className="clear-button">
            クリア
          </button>
        </div>
      </form>
    </div>
  );
}
