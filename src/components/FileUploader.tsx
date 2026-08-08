import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  fileCount: number;
  maxFiles: number;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelect,
  fileCount,
  maxFiles,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileCount < maxFiles && !isLoading) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      onFilesSelect(Array.from(selected));
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isDisabled = fileCount >= maxFiles || isLoading;

  return (
    <div
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDisabled
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        accept=".xlsx,.xls,.xlsm,.csv"
        className="hidden"
        disabled={isDisabled}
      />

      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className={`w-10 h-10 ${isDisabled ? 'text-gray-400' : 'text-blue-500'}`} />
        <div>
          <p className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {isDisabled ? 'All files uploaded' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Excel (.xlsx, .xls) or CSV (.csv) — select multiple files at once
          </p>
        </div>
        <p className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-blue-600'}`}>
          {fileCount} of {maxFiles} files
        </p>
      </div>
    </div>
  );
};

interface UploadedFileProps {
  fileName: string;
  label: string;
  rows: number;
  columns: number;
  isLoading: boolean;
  hasQualityIssues: boolean;
  onRemove: () => void;
  onLabelChange: (newLabel: string) => void;
}

export const UploadedFile: React.FC<UploadedFileProps> = ({
  fileName,
  label,
  rows,
  columns,
  isLoading,
  hasQualityIssues,
  onRemove,
  onLabelChange,
}) => {
  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [editValue, setEditValue] = React.useState(label);

  const handleSaveLabel = () => {
    if (editValue.trim()) {
      onLabelChange(editValue.trim());
      setIsEditingLabel(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="font-semibold text-sm text-gray-900">{fileName}</p>
            {hasQualityIssues && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                ⚠ Data Issues
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Period/Label</label>
              {isEditingLabel ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveLabel}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => setIsEditingLabel(true)}
                  className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 font-medium"
                >
                  {label}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Rows:</span>{' '}
                <span className="font-semibold text-gray-900">{rows.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Columns:</span>{' '}
                <span className="font-semibold text-gray-900">{columns}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onRemove}
          disabled={isLoading}
          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
