interface Props {
  column: string;
  label: string;
  currentSort?: string;
  currentOrder?: string;
  onSort: (column: string) => void;
}

export default function SortableHeader({ column, label, currentSort, currentOrder, onSort }: Props) {
  const isActive = currentSort === column;
  const arrow = isActive ? (currentOrder === 'asc' ? '▲' : '▼') : '';
  
  return (
    <th 
      onClick={() => onSort(column)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      title="クリックでソート"
    >
      {label} {arrow}
    </th>
  );
}