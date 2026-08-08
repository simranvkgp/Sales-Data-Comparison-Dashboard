import React from 'react';
import type { FileData } from '../types';
import { AlertCircle } from 'lucide-react';

interface DataQualityPanelProps {
  files: FileData[];
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({ files }) => {
  const allIssues = files.flatMap(f =>
    f.dataQualityIssues.map(issue => ({
      fileName: f.fileName,
      ...issue,
    }))
  );

  if (allIssues.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900">Data Quality Issues Detected</h3>
          <p className="text-sm text-yellow-800 mt-1">
            Some rows may have been skipped due to missing or invalid data:
          </p>
          <ul className="mt-2 space-y-1">
            {allIssues.map((issue, idx) => (
              <li key={idx} className="text-sm text-yellow-800">
                • <span className="font-medium">{issue.fileName}</span>: {issue.count} rows with{' '}
                {issue.type === 'missingProduct' && 'missing product names'}
                {issue.type === 'invalidQuantity' && 'invalid quantities'}
                {issue.type === 'invalidAmount' && 'invalid sales amounts'}
                {issue.type === 'invalidDate' && 'invalid dates'}
                {issue.type === 'duplicate' && 'duplicate rows'}
                {issue.type === 'empty' && 'empty rows'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
