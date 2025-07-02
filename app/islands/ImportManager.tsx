import { useState } from 'hono/jsx';
import ImportDialog from './ImportDialog';

export default function ImportManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleImport = async (files: File[], onProgress: (fileName: string, results: any[]) => void) => {
    for (const file of files) {
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

      // Update progress for this file
      onProgress(file.name, result.results);
    }

    // Don't auto-close dialog or refresh page - let user review results
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