import React from 'react';
import type { ProductComparison } from '../types';
import { getTopProducts, getLowestProducts } from '../utils/analysis';

interface TopProductsSectionProps {
  comparisons: ProductComparison[];
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const TopProductsSection: React.FC<TopProductsSectionProps> = ({
  comparisons,
  limit,
  onLimitChange,
}) => {
  const topProducts = getTopProducts(
    comparisons.flatMap(c => ({
      productName: c.productName,
      quantity: c.totalQuantity,
      salesAmount: c.totalSales,
    })),
    limit
  );

  const lowestProducts = getLowestProducts(comparisons, 5);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      {/* Top Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">🏆 Top Selling Products</h3>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>

        <div className="space-y-3">
          {topProducts.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{medals[idx] || `#${idx + 1}`}</span>
                <div>
                  <p className="font-semibold text-gray-900">{product.productName}</p>
                  <p className="text-xs text-gray-600">
                    {product.quantity.toLocaleString()} units
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ₹{(product.sales / 100000).toFixed(2)}L
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lowest Products */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📉 Lowest Performing Products</h3>

        <div className="space-y-3">
          {lowestProducts.map((product, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-red-600">#{idx + 1}</span>
                <div>
                  <p className="font-semibold text-gray-900">{product.productName}</p>
                  <p className="text-xs text-gray-600">
                    {product.quantity.toLocaleString()} units
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                  ₹{(product.sales / 100000).toFixed(2)}L
                </p>
                <p className={`text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.growth >= 0 ? '+' : ''}{product.growth.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
