import { useState, useEffect } from 'hono/jsx';
import type { Tag } from '@/db';

interface Props {
  availableTags: Tag[];
  selectedTags?: string[];
  onChange?: (selectedTags: string[]) => void;
  onTagsChange?: (tags: string[]) => void;
}

export default function TagSelector({ availableTags, selectedTags = [], onChange, onTagsChange }: Props) {
  const selectedTagNames = selectedTags?.filter(tag => tag.trim() !== '');
  const [selected, setSelected] = useState(selectedTagNames);
  const [isOpen, setIsOpen] = useState(false);

  // パネル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.tag-selector')) {
        // パネルを閉じる時に検索実行
        onTagsChange?.(selected);
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, selected, onTagsChange]);

  const handleToggle = (tagName: string) => {
    const newSelected = selected.includes(tagName)
      ? selected.filter(t => t !== tagName)
      : [...selected, tagName];
    
    setSelected(newSelected);
    onChange?.(newSelected);
    
    // フォーム上の隠しinputを更新（送信はしない）
    const form = document.querySelector('form[method="get"]') as HTMLFormElement;
    if (form) {
      // 既存の隠しタグinputを削除
      const existingTagInputs = form.querySelectorAll('input[name="tags"]');
      existingTagInputs.forEach(input => input.remove());
      
      // カンマ区切りで1つのinputとして追加
      if (newSelected.length > 0) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'tags';
        input.value = newSelected.join(',');
        form.appendChild(input);
      }
    }
  };

  const handleClear = () => {
    setSelected([]);
    onChange?.([]);
    
    // すべてクリア時は即座に検索実行
    onTagsChange?.([]);
  };

  const groupedTags = availableTags.reduce((acc, tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const categoryLabels: Record<string, string> = {
    language: '言語',
    framework: 'フレームワーク',
    library: 'ライブラリ',
    cloud: 'クラウド',
    database: 'データベース',
    devops: 'DevOps',
    other: 'その他'
  };

  return (
    <div className="tag-selector">
      {/* 選択されたタグの表示 */}
      <div className="selected-tags">
        {selected.map(tagName => (
          <span key={tagName} className="selected-tag">
            {tagName}
            <button 
              type="button" 
              onClick={() => {
                const newSelected = selected.filter(t => t !== tagName);
                setSelected(newSelected);
                onChange?.(newSelected);
                
                // 個別削除時は即座に検索実行
                onTagsChange?.(newSelected);
              }}
              className="remove-tag"
            >
              ×
            </button>
          </span>
        ))}
        {selected.length > 0 && (
          <button type="button" onClick={handleClear} className="clear-tags">
            すべてクリア
          </button>
        )}
      </div>

      {/* タグ選択ドロップダウン */}
      <div className="tag-dropdown">
        <button 
          type="button" 
          onClick={() => {
            if (isOpen) {
              // パネルを閉じる時に検索実行
              onTagsChange?.(selected);
            }
            setIsOpen(!isOpen);
          }}
          className="dropdown-toggle"
        >
          タグを選択 ({selected.length})
        </button>
        
        {isOpen && (
          <div className="dropdown-content">
            {Object.entries(groupedTags).map(([category, tags]) => (
              <div key={category} className="tag-category">
                <h4>{categoryLabels[category] || category}</h4>
                <div className="tag-options">
                  {tags.map(tag => (
                    <label key={tag.id} className="tag-option">
                      <input
                        type="checkbox"
                        checked={selected.includes(tag.name)}
                        onChange={() => handleToggle(tag.name)}
                      />
                      <span className={`tag tag-${tag.category}`}>
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 隠しinput要素でフォーム送信用 */}
      {selected.length > 0 && (
        <input
          type="hidden"
          name="tags"
          value={selected.join(',')}
        />
      )}
    </div>
  );
}