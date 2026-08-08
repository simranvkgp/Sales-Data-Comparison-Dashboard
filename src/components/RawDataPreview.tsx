import React from 'react';
import type { FileData } from '../types';
import { Trash2 } from 'lucide-react';

interface RawDataPreviewProps {
  files: FileData[];
  selectedIndex: number;
  onSelectFile: (index: number) => void;
  onRemoveFile: (index: number) => void;
}

export const RawDataPreview: React.FC<RawDataPreviewProps> = ({
  files,
  selectedIndex,
  onSelectFile,
  onRemoveFile,
}) => {
  if (files.length === 0) return null;

  const selectedFile = files[selectedIndex];
  const displayRecords = selectedFile.records.slice(0, 10);

  const columns = displayRecords.length > 0
    ? Object.keys(displayRecords[0])
    : Object.keys(selectedFile.columnMapping);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Raw Data Preview</h2>
      </div>

      {/* File Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center">
            <button
              onClick={() => onSelectFile(idx)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                selectedIndex === idx
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {file.label}
            </button>
            <button
              onClick={() => onRemoveFile(idx)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* File Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <p className="text-gray-700">
          <span className="font-semibold">File:</span> {selectedFile.fileName}
        </p>
        <p className="text-gray-700">
          <span className="font-semibold">Rows:</span> {selectedFile.records.length.toLocaleString()} |
          <span className="font-semibold ml-4">Columns:</span> {columns.length}
        </p>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              {columns.map(col => (
                <th key={col} className="text-left py-3 px-4 font-semibold text-gray-900">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRecords.map((record, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(col => (
                  <td key={`${rowIdx}-${col}`} className="py-3 px-4 text-gray-900">
                    {col === 'salesAmount' || col === 'profit' || col === 'cost'
                      ? `₹${Number(record[col]).toLocaleString('en-IN')}`
                      : col === 'quantity'
                      ? Number(record[col]).toLocaleString('en-IN')
                      : String(record[col] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFile.records.length > 10 && (
        <p className="text-xs text-gray-500 mt-4">
          Showing first 10 of {selectedFile.records.length.toLocaleString()} rows
        </p>
      )}
    </div>
  );
};
