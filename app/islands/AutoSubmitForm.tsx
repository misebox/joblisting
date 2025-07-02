import { useState, useEffect } from 'hono/jsx';
import SelectBox from '@/islands/SelectBox';
import SearchInput from '@/islands/SearchInput';
import TagSelector from '@/islands/TagSelector';
import FormField from '@/components/FormField';
import type { Tag } from '@/db';
import { saveSearchConditions, loadSearchConditions, clearSearchConditions, defaultConditions, SearchConditions } from '@/utils/searchStorage';
import { navigateWithSearchConditions } from '@/utils/navigation';

interface Props {
  status?: string;
  starred?: string;
  search?: string;
  sort?: string;
  order?: string;
  selectedTags?: string[];
  availableTags?: Tag[];
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
  { value: 'status', label: '状態' }
];

const orderOptions = [
  { value: 'desc', label: '降順' },
  { value: 'asc', label: '昇順' }
];

export default function AutoSubmitForm({ status = 'all', starred = '', search = '', sort = 'updatedAt', order = 'desc', selectedTags = [], availableTags = [] }: Props) {
  const [currentConditions, setCurrentConditions] = useState({
    status,
    starred,
    search,
    sort,
    order,
    tags: selectedTags,
  });

  // 共通のフォームからの条件抽出関数
  const extractConditionsFromForm = (form: HTMLFormElement): SearchConditions => {
    const formData = new FormData(form);
    const tags = formData.getAll('tags') as string[];
    return {
      status: formData.get('status') as string || 'all',
      starred: formData.get('starred') as string || '',
      search: formData.get('search') as string || '',
      sort: formData.get('sort') as string || 'updatedAt',
      order: formData.get('order') as string || 'desc',
      tags: tags
    };
  };

  // 共通のページ遷移関数（localStorage保存も含む）
  const navigateWithParams = (conditions: SearchConditions) => {
    setCurrentConditions(conditions);
    navigateWithSearchConditions(conditions);
  };

  // Load from localStorage on mount, but prefer URL params if they exist
  useEffect(() => {
    const currentTags = selectedTags;
    const hasUrlParams = status !== 'all' || starred !== '' || search !== '' || sort !== 'updatedAt' || order !== 'desc' || currentTags.length > 0;
    if (!hasUrlParams) {
      const stored = loadSearchConditions();
      setCurrentConditions(stored);
      // If we have stored conditions, navigate to them
      if (stored.status !== 'all' || stored.starred !== '' || stored.search !== '' || stored.sort !== 'updatedAt' || stored.order !== 'desc' || stored.tags.length > 0) {
        navigateWithSearchConditions(stored);
      }
    } else {
      // Save URL params to localStorage
      saveSearchConditions({ status, starred, search, sort, order, tags: currentTags });
    }
  }, []);

  const handleChange = (event: Event) => {
    const form = (event.target as HTMLSelectElement).form;
    if (form) {
      event.preventDefault();
      const conditions = extractConditionsFromForm(form);
      navigateWithParams(conditions);
    }
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const conditions = extractConditionsFromForm(form);
    navigateWithParams(conditions);
  };

  const handleClear = () => {
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
        
        <FormField label="タグ">
          <TagSelector 
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagsChange={(tags) => {
              const updatedConditions = { ...currentConditions, tags };
              navigateWithParams(updatedConditions);
            }}
          />
        </FormField>
        
        <FormField label="検索" htmlFor="search">
          <SearchInput 
            defaultValue={search}
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
