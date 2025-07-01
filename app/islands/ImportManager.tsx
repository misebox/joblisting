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
      console.error('Import API error:', result);
      let errorMessage = result.error || 'Import failed';
      if (result.details && result.details.length > 0) {
        errorMessage += '\n\nDetails:\n' + result.details.map(d => 
          `Block ${d.blockIndex}: ${d.type} - ${d.detail}`
        ).join('\n');
      }
      throw new Error(errorMessage);
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