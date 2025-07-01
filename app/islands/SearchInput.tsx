import { useState } from 'hono/jsx';

interface Props {
  initialValue?: string;
  onChange?: (event: Event) => void;
}

export default function SearchInput({ initialValue = '', onChange }: Props) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input 
      type="text" 
      name="search" 
      id="search" 
      placeholder="タイトル、会社名など" 
      value={value}
      onChange={handleChange}
    />
  );
}