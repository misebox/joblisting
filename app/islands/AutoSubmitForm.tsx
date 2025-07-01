import { useState, useEffect } from 'hono/jsx';
import SelectBox from '@/islands/SelectBox';
import SearchInput from '@/islands/SearchInput';
import FormField from '@/components/FormField';
import { saveSearchConditions, loadSearchConditions, clearSearchConditions, defaultConditions, SearchConditions } from '@/utils/searchStorage';

interface Props {
  status?: string;
  starred?: string;
  search?: string;
  sort?: string;
  order?: string;
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

const sortOptions = [
  { value: 'updatedAt', label: '更新日時' },
  { value: 'createdAt', label: '作成日時' },
  { value: 'title', label: '案件名' },
  { value: 'company', label: '会社名' },
  { value: 'price', label: '単価' },
  { value: 'location', label: '場所' },
  { value: 'period', label: '期間' },
  { value: 'description', label: '概要' },
  { value: 'requirements', label: '必須スキル' },
  { value: 'status', label: '状態' }
];

const orderOptions = [
  { value: 'desc', label: '降順' },
  { value: 'asc', label: '昇順' }
];

export default function AutoSubmitForm({ status = 'all', starred = '', search = '', sort = 'updatedAt', order = 'desc' }: Props) {
  const [currentConditions, setCurrentConditions] = useState({
    status,
    starred,
    search,
    sort,
    order,
  });

  // 共通のページ遷移関数
  const navigateWithParams = (conditions: SearchConditions) => {
    const params = new URLSearchParams();
    if (conditions.status !== 'all') params.set('status', conditions.status);
    if (conditions.starred !== '') params.set('starred', conditions.starred);
    if (conditions.search !== '') params.set('search', conditions.search);
    if (conditions.sort !== 'updatedAt') params.set('sort', conditions.sort);
    if (conditions.order !== 'desc') params.set('order', conditions.order);
    
    const queryString = params.toString();
    window.location.href = queryString ? `/?${queryString}` : '/';
  };

  // Load from localStorage on mount, but prefer URL params if they exist
  useEffect(() => {
    const hasUrlParams = status !== 'all' || starred !== '' || search !== '' || sort !== 'updatedAt' || order !== 'desc';
    if (!hasUrlParams) {
      const stored = loadSearchConditions();
      setCurrentConditions(stored);
      // If we have stored conditions, navigate to them
      if (stored.status !== 'all' || stored.starred !== '' || stored.search !== '' || stored.sort !== 'updatedAt' || stored.order !== 'desc') {
        navigateWithParams(stored);
      }
    } else {
      // Save URL params to localStorage
      saveSearchConditions({ status, starred, search, sort, order });
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
        search: formData.get('search') as string || '',
        sort: formData.get('sort') as string || 'updatedAt',
        order: formData.get('order') as string || 'desc'
      };
      
      // 意味のある検索条件がある場合のみlocalStorageに保存
      if (conditions.status !== 'all' || conditions.starred !== '' || conditions.search !== '' || conditions.sort !== 'updatedAt' || conditions.order !== 'desc') {
        saveSearchConditions(conditions);
      }
      
      // 手動でページ遷移
      event.preventDefault();
      navigateWithParams(conditions);
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
      search: formData.get('search') as string || '',
      sort: formData.get('sort') as string || 'updatedAt',
      order: formData.get('order') as string || 'desc'
    };
    
    // 意味のある検索条件がある場合のみlocalStorageに保存
    saveSearchConditions(conditions);
    
    // localStorage保存後に手動でページ遷移
    navigateWithParams(conditions);
  };

  const handleClear = () => {
    clearSearchConditions();
    navigateWithParams(defaultConditions);
  };

  return (
    <div className="filters">
      <form method="get" action="/" onSubmit={handleSubmit}>
        <FormField label="ステータス" htmlFor="status">
          <SelectBox 
            key={`status-${status}`}
            name="status"
            id="status"
            defaultValue={status}
            options={statusOptions}
            onChange={handleChange}
          />
        </FormField>
       
        <FormField label="スター" htmlFor="starred">
          <SelectBox 
            key={`starred-${starred}`}
            name="starred"
            id="starred"
            defaultValue={starred}
            options={starredOptions}
            onChange={handleChange}
          />
        </FormField>
        
        <FormField label="検索" htmlFor="search">
          <SearchInput 
            defaultValue={search}
          />
        </FormField>
        
        <FormField label="並び順" htmlFor="sort">
          <SelectBox 
            key={`sort-${sort}`}
            name="sort"
            id="sort"
            defaultValue={sort}
            options={sortOptions}
            onChange={handleChange}
          />
        </FormField>
        
        <FormField label="順序" htmlFor="order">
          <SelectBox 
            key={`order-${order}`}
            name="order"
            id="order"
            defaultValue={order}
            options={orderOptions}
            onChange={handleChange}
          />
        </FormField>
        
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
