import type { ReactNode } from 'hono/jsx';

interface Props {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, children }: Props) {
  return (
    <div className="filter-group">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}