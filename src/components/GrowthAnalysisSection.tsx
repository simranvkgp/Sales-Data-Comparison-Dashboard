import React from 'react';
import type { ProductComparison } from '../types';
import { getGrowingProducts, getDeclineingProducts } from '../utils/analysis';

interface GrowthAnalysisSectionProps {
  comparisons: ProductComparison[];
}

export const GrowthAnalysisSection: React.FC<GrowthAnalysisSectionProps> = ({
  comparisons,
}) => {
  const growingProducts = getGrowingProducts(comparisons, 5);
  const decliningProducts = getDeclineingProducts(comparisons, 5);

  return (
    <div className="space-y-6">
      {/* Growing Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚀 Top Growing Products</h3>

        {growingProducts.length > 0 ? (
          <div className="space-y-3">
            {growingProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-600">+{idx + 1}</span>
                  <p className="font-semibold text-gray-900">{product.productName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{product.growth.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">
                    ₹{(product.sales / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No growing products found</p>
        )}
      </div>

      {/* Declining Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📉 Products Needing Attention</h3>

        {decliningProducts.length > 0 ? (
          <div className="space-y-3">
            {decliningProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-600">⚠ {idx + 1}</span>
                  <p className="font-semibold text-gray-900">{product.productName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{product.growth.toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">
                    ₹{(product.sales / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No declining products found</p>
        )}
      </div>
    </div>
  );
};
