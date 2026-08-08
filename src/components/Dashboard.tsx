import React, { useState } from 'react';
import type { FileData, FilterState } from '../types';
import { SummaryCards } from './SummaryCards';
import { ComparisonChart } from './ComparisonChart';
import { ProductComparisonTable } from './ProductComparisonTable';
import { TopProductsSection } from './TopProductsSection';
import { GrowthAnalysisSection } from './GrowthAnalysisSection';
import { SalesInsightsSection } from './SalesInsightsSection';
import { FiltersBar } from './FiltersBar';
import { DataQualityPanel } from './DataQualityPanel';
import { RawDataPreview } from './RawDataPreview';
import { ExportButton } from './ExportButton';
import {
  calculateMetrics,
  getPeriodComparisons,
  getProductComparisons,
  getTopProducts,
  getDeclineingProducts,
  generateInsights,
} from '../utils/analysis';

interface DashboardProps {
  files: FileData[];
  onExport: () => void;
  onRemoveFile: (index: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  files,
  onExport,
  onRemoveFile,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    periods: files.map(f => f.label),
    products: [],
    categories: [],
    dateRange: {},
  });

  const [selectedPreviewFile, setSelectedPreviewFile] = useState(0);
  const [chartMetric, setChartMetric] = useState<'sales' | 'quantity' | 'orders' | 'profit'>('sales');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [topProductLimit, setTopProductLimit] = useState(10);

  // Filter files based on selected periods
  const filteredFiles = files.filter(f => filters.periods.includes(f.label));

  // Get all products from filtered files
  const allProducts = new Set<string>();
  filteredFiles.forEach(f => {
    f.records.forEach(r => {
      allProducts.add(r.productName);
    });
  });

  // Filter records based on selected products
  const getFilteredRecords = (fileIndex: number) => {
    const file = filteredFiles[fileIndex];
    if (!file) return [];

    let filtered = [...file.records];

    // Filter by products if selected
    if (filters.products.length > 0) {
      filtered = filtered.filter(r => filters.products.includes(r.productName));
    }

    // Filter by categories if selected
    if (filters.categories.length > 0) {
      filtered = filtered.filter(r => filters.categories.includes(r.category!));
    }

    // Filter by date range
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(r => {
        if (!r.date) return true;
        if (filters.dateRange.from && r.date < filters.dateRange.from) return false;
        if (filters.dateRange.to && r.date > filters.dateRange.to) return false;
        return true;
      });
    }

    return filtered;
  };

  // Create filtered file data for analysis
  const filteredFilesData: FileData[] = filteredFiles.map((file, idx) => ({
    ...file,
    records: getFilteredRecords(idx),
  }));

  // Calculate metrics
  const periodComparisons = getPeriodComparisons(filteredFilesData);
  const productComparisons = getProductComparisons(filteredFilesData);
  const insights = generateInsights(filteredFilesData, productComparisons);

  const metrics = filteredFilesData.length > 0
    ? calculateMetrics(filteredFilesData.flatMap(f => f.records))
    : null;

  const hasDataQualityIssues = files.some(f => f.dataQualityIssues.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
        <ExportButton
          onExport={onExport}
          periodComparisons={periodComparisons}
          productComparisons={productComparisons}
          topProducts={getTopProducts(filteredFilesData.flatMap(f => f.records), topProductLimit)}
          declineingProducts={getDeclineingProducts(productComparisons, 10)}
        />
      </div>

      {/* Data Quality Warnings */}
      {hasDataQualityIssues && (
        <DataQualityPanel files={files} />
      )}

      {/* Filters */}
      <FiltersBar
        files={filteredFiles}
        filters={filters}
        onFiltersChange={setFilters}
        allProducts={Array.from(allProducts)}
      />

      {/* Summary Cards */}
      {metrics && (
        <SummaryCards metrics={metrics} previousMetrics={periodComparisons[periodComparisons.length - 2]} />
      )}

      {/* Period Comparison Table */}
      {periodComparisons.length >= 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Period Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Period</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Sales</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Orders</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">AOV</th>
                  {periodComparisons.some(p => p.profit) && (
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Profit</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {periodComparisons.map((period, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{period.period}</td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      ₹{(period.sales / 100000).toFixed(2)}L
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      {period.orders.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      {period.quantity.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-900">
                      ₹{period.aov.toFixed(0)}
                    </td>
                    {period.profit && (
                      <td className="text-right py-3 px-4 text-gray-900">
                        ₹{(period.profit / 100000).toFixed(2)}L
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <ComparisonChart
        periodComparisons={periodComparisons}
        metric={chartMetric}
        onMetricChange={setChartMetric}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />

      {/* Product Comparison Table */}
      {productComparisons.length > 0 && (
        <ProductComparisonTable
          comparisons={productComparisons}
          periods={filteredFiles.map(f => f.label)}
        />
      )}

      {/* Growth Analysis & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthAnalysisSection comparisons={productComparisons} />
        <TopProductsSection
          comparisons={productComparisons}
          limit={topProductLimit}
          onLimitChange={setTopProductLimit}
        />
      </div>

      {/* Sales Insights */}
      <SalesInsightsSection insights={insights} />

      {/* Raw Data Preview */}
      <RawDataPreview
        files={filteredFiles}
        selectedIndex={selectedPreviewFile}
        onSelectFile={setSelectedPreviewFile}
        onRemoveFile={onRemoveFile}
      />
    </div>
  );
};
