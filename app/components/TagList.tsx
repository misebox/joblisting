import type { Tag } from '@/db';

interface Props {
  tags?: Tag[];
  maxVisible?: number;
}

export default function TagList({ tags = [], maxVisible = 4 }: Props) {
  if (!tags || tags.length === 0) {
    return <span>-</span>;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = tags.length - maxVisible;

  return (
    <div className="tags">
      {visibleTags.map((tag, index) => (
        <span key={index} className={`tag tag-${tag.category}`}>
          {tag.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="tag-more">+{hiddenCount}</span>
      )}
    </div>
  );
}