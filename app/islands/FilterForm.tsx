import AutoSubmitForm from '@/islands/AutoSubmitForm';

interface Props {
  status?: string;
  starred?: string;
  search?: string;
}

export default function FilterForm({ status = 'all', starred = '', search = '' }: Props) {
  return (
    <AutoSubmitForm 
      status={status}
      starred={starred}
      search={search}
    />
  );
}