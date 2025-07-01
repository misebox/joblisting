import { useState } from 'hono/jsx';

interface Props {
  initialValue?: string;
}

export default function SearchInput({ initialValue = '' }: Props) {
  const [value, setValue] = useState(initialValue);

  return (
    <input 
      type="text" 
      name="search" 
      id="search" 
      placeholder="タイトル、会社名など" 
      value={value}
      onChange={e => setValue((e.target as HTMLInputElement)?.value)}
    />
  );
}