import React from 'react';
import type { SalesInsight } from '../types';

interface SalesInsightsSectionProps {
  insights: SalesInsight[];
}

export const SalesInsightsSection: React.FC<SalesInsightsSectionProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Sales Insights</h2>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
            <span className="text-xl flex-shrink-0">{insight.icon}</span>
            <div>
              <p className="font-semibold text-gray-900">{insight.title}</p>
              <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
