import { useState } from 'hono/jsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function ImportDialog({ isOpen, onClose, onImport }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      setUploadStatus({ success: false, message: 'テキストファイル(.txt)のみ対応しています' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      await onImport(file);
      setUploadStatus({ success: true, message: 'ファイルを正常に取り込みました' });
      setTimeout(() => {
        onClose();
        setUploadStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      setUploadStatus({ success: false, message: 'ファイルの取り込みに失敗しました' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      handleFileSelect(file);
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
      handleFileSelect(files[0]);
    }
  };

  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="dialog-backdrop" onClick={handleBackdropClick}>
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>案件データ取り込み</h2>
          <button className="close-button" onClick={onClose}>×</button>
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
                      onChange={handleFileInput}
                      className="file-input"
                    />
                    ファイルを選択
                  </label>
                </div>
                <p className="file-note">対応形式: テキストファイル (.txt)</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}