export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: '新規',
    reviewed: '確認済み',
    rejected: '却下'
  };
  return labels[status] || status;
}