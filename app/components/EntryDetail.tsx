import type { Entry } from '@/db';
import { formatFullDate } from '@/utils/formatting';

interface Props {
  entry: Entry;
}

export default function EntryDetail({ entry }: Props) {

  const renderField = (label: string, value: string | null) => {
    if (!value) return null;
    
    return (
      <div className="detail-field">
        <label>{label}</label>
        <p>{value}</p>
      </div>
    );
  };

  return (
    <>
      <div className="detail-header">
        <h1>{entry.title}</h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          登録日: {formatFullDate(entry.createdAt)} | 
          更新日: {formatFullDate(entry.updatedAt)}
        </p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {renderField('会社', entry.company)}
        {renderField('商流', entry.distribution)}
        {renderField('単価', entry.price)}
        {renderField('期間', entry.period)}
        {renderField('場所', entry.location)}
        {renderField('精算', entry.billing)}
        {renderField('面談', entry.interview)}
        {renderField('時間', entry.time)}
      </div>
      
      {renderField('備考', entry.notes)}
      {renderField('概要', entry.description)}
      {renderField('必須スキル', entry.requirements)}
      {renderField('尚可スキル', entry.preferences)}
      {renderField('開発環境', entry.techStack)}
    </>
  );
}