import { useState } from 'hono/jsx';
import ImportDialog from './ImportDialog';

export default function ImportManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/import', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Import failed');
    }

    // Refresh the page to show new entries
    window.location.reload();
  };

  return (
    <>
      <button 
        className="import-button" 
        onClick={() => setIsDialogOpen(true)}
      >
        案件取り込み
      </button>
      
      <ImportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onImport={handleImport}
      />
    </>
  );
}