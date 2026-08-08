import React from 'react';
import type { FileData, FilterState } from '../types';

interface FiltersBarProps {
  files: FileData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  allProducts: string[];
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  files,
  filters,
  onFiltersChange,
  allProducts,
}) => {
  const allCategories = new Set<string>();
  files.forEach(f => {
    f.records.forEach(r => {
      if (r.category) allCategories.add(r.category);
    });
  });

  const handlePeriodChange = (period: string) => {
    const newPeriods = filters.periods.includes(period)
      ? filters.periods.filter(p => p !== period)
      : [...filters.periods, period];

    onFiltersChange({ ...filters, periods: newPeriods });
  };

  const handleProductChange = (product: string) => {
    const newProducts = filters.products.includes(product)
      ? filters.products.filter(p => p !== product)
      : [...filters.products, product];

    onFiltersChange({ ...filters, products: newProducts });
  };

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, [type]: value || undefined },
    });
  };

  const handleReset = () => {
    onFiltersChange({
      periods: files.map(f => f.label),
      products: [],
      categories: [],
      dateRange: {},
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Period Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase">Period</label>
          <div className="mt-2 space-y-2">
            {files.map(file => (
              <label key={file.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.periods.includes(file.label)}
                  onChange={() => handlePeriodChange(file.label)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{file.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {allCategories.size > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase">Category</label>
            <div className="mt-2 space-y-2">
              {Array.from(allCategories).map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700 uppercase">Date Range</label>
          <div className="space-y-1">
            <input
              type="date"
              value={filters.dateRange.from || ''}
              onChange={(e) => handleDateChange('from', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.dateRange.to || ''}
              onChange={(e) => handleDateChange('to', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="To"
            />
          </div>
        </div>

        {/* Product Filter */}
        {allProducts.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-700 uppercase">Product</label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleProductChange(e.target.value);
                }
              }}
              className="w-full mt-2 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">+ Add Product</option>
              {allProducts.map(product => (
                <option key={product} value={product} disabled={filters.products.includes(product)}>
                  {product}
                </option>
              ))}
            </select>
            {filters.products.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {filters.products.map(product => (
                  <span
                    key={product}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                  >
                    {product}
                    <button
                      onClick={() => handleProductChange(product)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
