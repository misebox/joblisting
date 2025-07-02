import { useState } from 'hono/jsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (files: File[], onProgress: (fileName: string, results: any[]) => void) => Promise<void>;
}

interface ImportLog {
  fileName: string;
  entries: Array<{
    title: string;
    company: string;
    status: 'created' | 'updated' | 'skipped' | 'error';
  }>;
}

interface ImportStats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

export default function ImportDialog({ isOpen, onClose, onImport }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [importStats, setImportStats] = useState<ImportStats>({ created: 0, updated: 0, skipped: 0, errors: 0 });

  if (!isOpen) return null;

  const handleFileSelect = async (files: File[]) => {
    console.log('Selected files:', files);
    const txtFiles = files.filter(file => file.name.endsWith('.txt'));
    
    if (txtFiles.length === 0) {
      setUploadStatus({ success: false, message: 'テキストファイル(.txt)のみ対応しています' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setImportLogs([]);
    setImportStats({ created: 0, updated: 0, skipped: 0, errors: 0 });

    try {
      await onImport(txtFiles, updateImportProgress);
      setUploadStatus({ success: true, message: `${txtFiles.length}ファイルの取り込みが完了しました` });
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus({ success: false, message: 'ファイルの取り込みに失敗しました' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      handleFileSelect(Array.from(files));
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileSelect(Array.from(files));
    }
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    const hasImportedSomething = importStats.created > 0 || importStats.updated > 0;
    
    setImportLogs([]);
    setImportStats({ created: 0, updated: 0, skipped: 0, errors: 0 });
    setUploadStatus(null);
    onClose();
    
    // Refresh page if something was imported
    if (hasImportedSomething) {
      window.location.reload();
    }
  };

  // Function to update logs and stats (will be called from ImportManager)
  const updateImportProgress = (fileName: string, results: any[]) => {
    const newLog: ImportLog = {
      fileName,
      entries: results.map(r => ({
        title: r.title || 'Unknown',
        company: r.company || 'Unknown',
        status: r.status
      }))
    };

    setImportLogs(prev => [...prev, newLog]);
    
    const stats = results.reduce((acc, r) => {
      acc[r.status as keyof ImportStats]++;
      return acc;
    }, { created: 0, updated: 0, skipped: 0, errors: 0 });

    setImportStats(prev => ({
      created: prev.created + stats.created,
      updated: prev.updated + stats.updated,
      skipped: prev.skipped + stats.skipped,
      errors: prev.errors + stats.errors
    }));
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>案件データ取り込み</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="dialog-body">
          <div 
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="upload-status">
                <div className="loading-spinner"></div>
                <p>ファイルを処理中...</p>
              </div>
            ) : uploadStatus ? (
              <div className={`upload-status ${uploadStatus.success ? 'success' : 'error'}`}>
                <p>{uploadStatus.message}</p>
              </div>
            ) : (
              <>
                <div className="drop-zone-content">
                  <p>ファイルをここにドラッグ&ドロップ</p>
                  <p>または</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".txt"
                      multiple
                      onChange={handleFileInput}
                      className="file-input"
                    />
                    ファイルを選択
                  </label>
                </div>
                <p className="file-note">対応形式: テキストファイル (.txt)、複数ファイル対応</p>
              </>
            )}
          </div>
          
          {/* Import Progress Log */}
          {(importLogs.length > 0 || isUploading) && (
            <div className="import-progress">
              <h3>取り込み状況</h3>
              <div className="import-log">
                {importLogs.map((log, index) => (
                  <div key={index} className="import-file-log">
                    <div className="file-name">📁 {log.fileName}</div>
                    {log.entries.map((entry, entryIndex) => (
                      <div key={entryIndex} className={`import-entry-log ${entry.status}`}>
                        <span className="status-icon">
                          {entry.status === 'created' && '✅'}
                          {entry.status === 'updated' && '🔄'}
                          {entry.status === 'skipped' && '⏭️'}
                          {entry.status === 'error' && '❌'}
                        </span>
                        <span className="entry-info">
                          {entry.title} - {entry.company}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Import Stats */}
              <div className="import-stats">
                <div className="stat-item created">新規: {importStats.created}件</div>
                <div className="stat-item updated">更新: {importStats.updated}件</div>
                <div className="stat-item skipped">スキップ: {importStats.skipped}件</div>
                <div className="stat-item errors">エラー: {importStats.errors}件</div>
              </div>
              
              {/* Complete button after successful import */}
              {!isUploading && uploadStatus?.success && (
                <div className="import-complete">
                  <button onClick={handleClose} className="complete-button">
                    完了して閉じる
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}