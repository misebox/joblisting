interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  name: string;
  id: string;
  value: string;
  options: SelectOption[];
  onChange?: (event: Event) => void;
}

export default function SelectBox({ name, id, value, options, onChange }: Props) {
  const handleChange = (event: any) => {
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <select 
      name={name} 
      id={id} 
      value={value}
      onChange={handleChange}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}