import { saveSearchConditions, SearchConditions } from './searchStorage';

export const navigateWithSearchConditions = (conditions: SearchConditions) => {
  // Always save to localStorage
  saveSearchConditions(conditions);
  
  const params = new URLSearchParams();
  if (conditions.status !== 'all') params.set('status', conditions.status);
  if (conditions.starred !== '') params.set('starred', conditions.starred);
  if (conditions.search !== '') params.set('search', conditions.search);
  if (conditions.sort !== 'updatedAt') params.set('sort', conditions.sort);
  if (conditions.order !== 'desc') params.set('order', conditions.order);
  if (conditions.tags && conditions.tags.length > 0) {
    params.set('tags', conditions.tags.join(','));
  }
  
  const queryString = params.toString();
  window.location.href = queryString ? `/?${queryString}` : '/';
};

export const navigateWithUpdatedSort = (column: string, currentSort: string, currentOrder: string) => {
  const params = new URLSearchParams(window.location.search);
  
  // If clicking on the same column, toggle order
  if (params.get('sort') === column || (column === 'updatedAt' && !params.get('sort'))) {
    const newOrder = params.get('order') === 'asc' ? 'desc' : 'asc';
    params.set('order', newOrder);
  } else {
    // If clicking on a new column, set to desc
    params.set('order', 'desc');
  }
  
  params.set('sort', column);
  
  // Extract all conditions and save to localStorage
  const conditions: SearchConditions = {
    status: params.get('status') || 'all',
    starred: params.get('starred') || '',
    search: params.get('search') || '',
    sort: params.get('sort') || 'updatedAt',
    order: params.get('order') || 'desc',
    tags: params.get('tags') ? params.get('tags')!.split(',').filter(tag => tag.trim() !== '') : []
  };
  
  saveSearchConditions(conditions);
  window.location.href = `/?${params.toString()}`;
};