interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  name: string;
  id: string;
  value: string;
  options: SelectOption[];
}

export default function SelectBox({ name, id, value, options }: Props) {
  return (
    <select name={name} id={id} defaultValue={value}>
      {options.map(option => {
        // if (value === option.value) {
        //   return (
        //     <option key={option.value} value={option.value} selected>
        //       {option.label}
        //     </option>
        //   );
        // }
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}