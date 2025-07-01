interface Props {
  defaultValue?: string;
}

export default function SearchInput({ defaultValue = '' }: Props) {
  return (
    <input 
      type="text" 
      name="search" 
      id="search" 
      placeholder="タイトル、会社名など" 
      defaultValue={defaultValue}
    />
  );
}