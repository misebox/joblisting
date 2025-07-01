import { useState } from "hono/jsx";

interface Props {
  defaultValue?: string;
}

export default function SearchInput({ defaultValue = '' }: Props) {
  const [keyword, setKeyword] = useState(defaultValue);
  return (
    <input 
      type="text" 
      name="search" 
      id="search" 
      placeholder="タイトル、会社名など" 
      defaultValue={defaultValue}
      value={keyword}
    />
  );
}