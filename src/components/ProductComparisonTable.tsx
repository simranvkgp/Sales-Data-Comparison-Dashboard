import React, { useState } from 'react';
import type { ProductComparison } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ProductComparisonTableProps {
  comparisons: ProductComparison[];
  periods: string[];
}

type SortField = 'name' | 'sales' | 'growth';
type SortOrder = 'asc' | 'desc';

export const ProductComparisonTable: React.FC<ProductComparisonTableProps> = ({
  comparisons,
  periods,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('sales');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = comparisons.filter(c =>
    c.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'name':
        aVal = a.productName;
        bVal = b.productName;
        break;
      case 'sales':
        aVal = a.totalSales;
        bVal = b.totalSales;
        break;
      case 'growth':
        aVal = a.growth;
        bVal = b.growth;
        break;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIdx, startIdx + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Product Comparison</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th
                onClick={() => handleSort('name')}
                className="text-left py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  Product Name
                  <SortIcon field="name" />
                </div>
              </th>
              {periods.map(period => (
                <th key={period} className="text-right py-3 px-4 font-semibold text-gray-900">
                  {period}
                </th>
              ))}
              <th
                onClick={() => handleSort('sales')}
                className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-end gap-2">
                  Total Sales
                  <SortIcon field="sales" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growth')}
                className="text-right py-3 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-end gap-2">
                  Growth
                  <SortIcon field="growth" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((comp, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{comp.productName}</td>
                {periods.map(period => {
                  const val = comp.periods[period];
                  return (
                    <td key={period} className="text-right py-3 px-4 text-gray-900">
                      ₹{(val?.sales || 0).toLocaleString('en-IN')}
                    </td>
                  );
                })}
                <td className="text-right py-3 px-4 font-semibold text-gray-900">
                  ₹{(comp.totalSales / 100000).toFixed(2)}L
                </td>
                <td className={`text-right py-3 px-4 font-semibold ${
                  comp.growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {comp.growth !== null ? `${comp.growth >= 0 ? '+' : ''}${comp.growth.toFixed(1)}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
