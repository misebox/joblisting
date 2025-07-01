export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit'
  });
}

export function formatFullDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}