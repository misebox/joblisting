export interface SearchConditions {
  status: string;
  starred: string;
  search: string;
}

const STORAGE_KEY = 'jobparser_search_conditions';

export const defaultConditions: SearchConditions = {
  status: 'all',
  starred: '',
  search: ''
};

export function saveSearchConditions(conditions: SearchConditions): void {
  if (typeof window !== 'undefined') {
    try {
      console.log('Saving search conditions:', conditions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conditions));
    } catch (error) {
      console.warn('Failed to save search conditions:', error);
    }
  }
}

export function loadSearchConditions(): SearchConditions {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultConditions, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load search conditions:', error);
    }
  }
  return defaultConditions;
}

export function clearSearchConditions(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear search conditions:', error);
    }
  }
}