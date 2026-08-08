import React from 'react';
import { Download } from 'lucide-react';
import type { PeriodComparison, ProductComparison, TopProduct } from '../types';
import { exportToExcel } from '../utils/fileHandler';

interface ExportButtonProps {
  onExport: () => void;
  periodComparisons: PeriodComparison[];
  productComparisons: ProductComparison[];
  topProducts: TopProduct[];
  declineingProducts: TopProduct[];
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  periodComparisons,
  productComparisons,
  topProducts,
  declineingProducts,
}) => {
  const handleExportExcel = () => {
    const exportData = {
      summary: {
        'Total Sales': periodComparisons.reduce((sum, p) => sum + p.sales, 0),
        'Total Orders': periodComparisons.reduce((sum, p) => sum + p.orders, 0),
        'Total Quantity': periodComparisons.reduce((sum, p) => sum + p.quantity, 0),
        'Average AOV': periodComparisons.length > 0
          ? periodComparisons.reduce((sum, p) => sum + p.aov, 0) / periodComparisons.length
          : 0,
      },
      periodComparison: periodComparisons.map(p => ({
        Period: p.period,
        Sales: p.sales,
        Orders: p.orders,
        Quantity: p.quantity,
        'Avg Order Value': p.aov,
        Profit: p.profit || 0,
      })),
      productComparison: productComparisons.slice(0, 50).map(p => ({
        Product: p.productName,
        'Total Sales': p.totalSales,
        'Total Quantity': p.totalQuantity,
        'Growth %': p.growth,
      })),
      topProducts: topProducts.map(p => ({
        Rank: p.rank,
        Product: p.productName,
        Quantity: p.quantity,
        'Total Sales': p.sales,
        Growth: `${p.growth.toFixed(2)}%`,
      })),
      declineingProducts: declineingProducts.map(p => ({
        Rank: p.rank,
        Product: p.productName,
        Quantity: p.quantity,
        'Total Sales': p.sales,
        'Growth %': `${p.growth.toFixed(2)}%`,
      })),
    };

    exportToExcel(exportData, `Sales_Comparison_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleExportExcel}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
    >
      <Download className="w-5 h-5" />
      Export to Excel
    </button>
  );
};
