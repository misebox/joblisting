import { getStatusLabel } from '@/utils/status';

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const label = getStatusLabel(status);
  
  return (
    <span className={`status status-${status}`}>
      {label}
    </span>
  );
}