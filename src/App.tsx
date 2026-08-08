import React, { useState } from 'react';
import type { FileData, ColumnMapping } from './types';
import { FileUploader, UploadedFile } from './components/FileUploader';
import { ColumnMapper } from './components/ColumnMapper';
import { Dashboard } from './components/Dashboard';
import { processFileUpload } from './utils/fileHandler';
import { normalizeRecords } from './utils/dataProcessor';
import { createDemoData } from './utils/fileHandler';

type AppState = 'upload' | 'mapping' | 'dashboard';

const MAX_FILES = 3;

interface UploadingFile {
  fileName: string;
  label: string;
  originalData: any[];
  headers: string[];
  columnMapping: ColumnMapping;
}

export const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processNextInQueue = async (queue: File[]) => {
    if (queue.length === 0) {
      setIsLoading(false);
      return;
    }

    const [next, ...rest] = queue;
    setUploadQueue(rest);

    try {
      setIsLoading(true);
      const processed = await processFileUpload(next);
      setUploadingFile(processed);
      setAppState('mapping');
      setIsLoading(false);
    } catch (err) {
      setError(`${next.name}: ${err instanceof Error ? err.message : 'Failed to process file'}`);
      processNextInQueue(rest);
    }
  };

  const handleFilesSelect = (selectedFiles: File[]) => {
    setError(null);

    const remainingSlots = MAX_FILES - files.length;
    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    const skipped = selectedFiles.length - filesToProcess.length;

    if (skipped > 0) {
      setError(
        `Only ${remainingSlots} more file(s) can be added (max ${MAX_FILES} total). ${skipped} file(s) were skipped.`
      );
    }

    if (filesToProcess.length > 0) {
      processNextInQueue(filesToProcess);
    }
  };

  const handleMappingConfirm = (mapping: ColumnMapping) => {
    if (!uploadingFile) return;

    try {
      const { records, issues } = normalizeRecords(
        uploadingFile.originalData,
        mapping
      );

      const newFile: FileData = {
        fileName: uploadingFile.fileName,
        label: uploadingFile.label,
        records,
        originalData: uploadingFile.originalData,
        columnMapping: mapping,
        dataQualityIssues: issues,
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      setUploadingFile(null);

      if (uploadQueue.length > 0) {
        processNextInQueue(uploadQueue);
      } else {
        setIsLoading(false);
        setAppState(updatedFiles.length >= 2 ? 'dashboard' : 'upload');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setIsLoading(false);
    }
  };

  const handleLoadDemo = () => {
    try {
      const demo = createDemoData();
      setFiles(demo);
      setAppState('dashboard');
    } catch (err) {
      setError('Failed to load demo data');
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, idx) => idx !== index);
    setFiles(newFiles);

    if (newFiles.length < 2) {
      setAppState('upload');
    }
  };

  const handleUpdateLabel = (index: number, newLabel: string) => {
    const updated = [...files];
    updated[index].label = newLabel;
    setFiles(updated);
  };

  const handleExport = () => {
    // Export happens in ExportButton component
  };

  const canGoToDashboard = files.length >= 2;
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sales Data Comparison Dashboard</h1>
          <p className="text-gray-600">Upload and compare your sales data across multiple periods</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload & Mapping State */}
        {appState === 'upload' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Sales Files</h2>

              <div className="mb-8">
                <FileUploader
                  onFilesSelect={handleFilesSelect}
                  fileCount={files.length}
                  maxFiles={MAX_FILES}
                  isLoading={isLoading}
                />
              </div>

              {/* Uploaded Files */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
                  <div className="space-y-3">
                    {files.map((file, idx) => (
                      <UploadedFile
                        key={idx}
                        fileName={file.fileName}
                        label={file.label}
                        rows={file.records.length}
                        columns={Object.keys(file.columnMapping).length}
                        isLoading={isLoading}
                        hasQualityIssues={file.dataQualityIssues.length > 0}
                        onRemove={() => handleRemoveFile(idx)}
                        onLabelChange={(newLabel) => handleUpdateLabel(idx, newLabel)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {canGoToDashboard && (
                  <button
                    onClick={() => setAppState('dashboard')}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard ({files.length} files)
                  </button>
                )}
                {files.length < 2 && (
                  <button
                    onClick={handleLoadDemo}
                    className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Load Demo Data
                  </button>
                )}
              </div>

              {files.length < 2 && (
                <p className="text-sm text-gray-600 mt-4">
                  Upload at least 2 files to generate a comparison dashboard.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mapping State */}
        {appState === 'mapping' && uploadingFile && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {uploadQueue.length > 0 && (
              <p className="text-sm text-blue-600 font-medium mb-4">
                {uploadQueue.length} more file{uploadQueue.length > 1 ? 's' : ''} queued — map this one to continue.
              </p>
            )}
            <ColumnMapper
              fileName={uploadingFile.fileName}
              headers={uploadingFile.headers}
              currentMapping={uploadingFile.columnMapping}
              onMappingChange={(mapping) => {
                setUploadingFile({ ...uploadingFile, columnMapping: mapping });
              }}
              onConfirm={() => handleMappingConfirm(uploadingFile.columnMapping)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Dashboard State */}
        {appState === 'dashboard' && files.length >= 2 && (
          <Dashboard
            files={files}
            onExport={handleExport}
            onRemoveFile={handleRemoveFile}
          />
        )}
      </div>
    </div>
  );
};

export default App;
