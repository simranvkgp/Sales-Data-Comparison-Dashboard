import type {
  SalesRecord,
  ComparisonMetrics,
  PeriodComparison,
  ProductComparison,
  TopProduct,
  SalesInsight,
  FileData,
} from '../types';

export function calculateMetrics(records: SalesRecord[]): ComparisonMetrics {
  if (records.length === 0) {
    return {
      totalSales: 0,
      totalOrders: records.length,
      totalQuantity: 0,
      averageOrderValue: 0,
    };
  }

  const totalSales = records.reduce((sum, r) => sum + (r.salesAmount || 0), 0);
  const totalQuantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const totalOrders = records.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  let totalProfit: number | undefined;
  let profitMargin: number | undefined;

  if (records.some(r => r.profit !== undefined)) {
    totalProfit = records.reduce((sum, r) => sum + (r.profit || 0), 0);
    if (totalSales > 0) {
      profitMargin = (totalProfit / totalSales) * 100;
    }
  }

  return {
    totalSales,
    totalOrders,
    totalQuantity,
    averageOrderValue,
    totalProfit,
    profitMargin,
  };
}

export function getPeriodComparisons(
  files: FileData[]
): PeriodComparison[] {
  return files.map(file => {
    const metrics = calculateMetrics(file.records);
    return {
      period: file.label,
      sales: metrics.totalSales,
      orders: metrics.totalOrders,
      quantity: metrics.totalQuantity,
      aov: metrics.averageOrderValue,
      profit: metrics.totalProfit,
    };
  });
}

export function getProductComparisons(
  files: FileData[]
): ProductComparison[] {
  const productMap = new Map<string, ProductComparison>();

  files.forEach(file => {
    file.records.forEach(record => {
      if (!productMap.has(record.productName)) {
        productMap.set(record.productName, {
          productName: record.productName,
          periods: {},
          totalQuantity: 0,
          totalSales: 0,
          growth: 0,
        });
      }

      const comparison = productMap.get(record.productName)!;
      if (!comparison.periods[file.label]) {
        comparison.periods[file.label] = {
          quantity: 0,
          sales: 0,
        };
      }

      comparison.periods[file.label].quantity += record.quantity;
      comparison.periods[file.label].sales += record.salesAmount;
      comparison.totalQuantity += record.quantity;
      comparison.totalSales += record.salesAmount;
    });
  });

  // Calculate growth
  const comparisons = Array.from(productMap.values());
  const periods = files.map(f => f.label);

  if (periods.length >= 2) {
    const lastPeriod = periods[periods.length - 1];
    const prevPeriod = periods[periods.length - 2];

    comparisons.forEach(comp => {
      const currentSales = comp.periods[lastPeriod]?.sales || 0;
      const prevSales = comp.periods[prevPeriod]?.sales || 0;

      if (prevSales > 0) {
        comp.growth = ((currentSales - prevSales) / prevSales) * 100;
      } else if (currentSales > 0) {
        comp.growth = 100; // New product
      }
    });
  }

  return comparisons.sort((a, b) => b.totalSales - a.totalSales);
}

export function getTopProducts(
  records: SalesRecord[],
  limit: number = 10
): TopProduct[] {
  const productMap = new Map<string, TopProduct>();

  records.forEach(record => {
    if (!productMap.has(record.productName)) {
      productMap.set(record.productName, {
        rank: 0,
        productName: record.productName,
        quantity: 0,
        sales: 0,
        growth: 0,
      });
    }

    const product = productMap.get(record.productName)!;
    product.quantity += record.quantity;
    product.sales += record.salesAmount;
  });

  const sorted = Array.from(productMap.values())
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);

  sorted.forEach((product, index) => {
    product.rank = index + 1;
  });

  return sorted;
}

export function getLowestProducts(
  comparisons: ProductComparison[],
  limit: number = 5
): TopProduct[] {
  const lowest = comparisons
    .sort((a, b) => a.totalSales - b.totalSales)
    .slice(0, limit);

  return lowest.map((comp, index) => ({
    rank: index + 1,
    productName: comp.productName,
    quantity: comp.totalQuantity,
    sales: comp.totalSales,
    growth: comp.growth,
  }));
}

export function getGrowingProducts(
  comparisons: ProductComparison[],
  limit: number = 5
): TopProduct[] {
  const growing = comparisons
    .filter(c => c.growth > 0)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, limit);

  return growing.map((comp, index) => ({
    rank: index + 1,
    productName: comp.productName,
    quantity: comp.totalQuantity,
    sales: comp.totalSales,
    growth: comp.growth,
  }));
}

export function getDeclineingProducts(
  comparisons: ProductComparison[],
  limit: number = 5
): TopProduct[] {
  const declining = comparisons
    .filter(c => c.growth < 0)
    .sort((a, b) => a.growth - b.growth)
    .slice(0, limit);

  return declining.map((comp, index) => ({
    rank: index + 1,
    productName: comp.productName,
    quantity: comp.totalQuantity,
    sales: comp.totalSales,
    growth: comp.growth,
  }));
}

export function generateInsights(
  files: FileData[],
  comparisons: ProductComparison[]
): SalesInsight[] {
  const insights: SalesInsight[] = [];
  const periods = getPeriodComparisons(files);

  if (periods.length === 0) return insights;

  // Find highest revenue period
  const highestPeriod = periods.reduce((max, p) =>
    p.sales > max.sales ? p : max
  );

  if (highestPeriod) {
    insights.push({
      icon: '📈',
      title: 'Peak Revenue Period',
      description: `${highestPeriod.period} generated the highest revenue at ${formatCurrency(highestPeriod.sales)}.`,
    });
  }

  // Calculate growth between last two periods
  if (periods.length >= 2) {
    const lastIdx = periods.length - 1;
    const growth =
      ((periods[lastIdx].sales - periods[lastIdx - 1].sales) /
        periods[lastIdx - 1].sales) *
      100;

    if (growth !== 0) {
      const direction = growth > 0 ? 'increased' : 'decreased';
      insights.push({
        icon: growth > 0 ? '📊' : '📉',
        title: `Sales ${growth > 0 ? 'Growth' : 'Decline'}`,
        description: `Sales ${direction} by ${Math.abs(growth).toFixed(1)}% from ${periods[lastIdx - 1].period} to ${periods[lastIdx].period}.`,
      });
    }
  }

  // Top selling product
  const topProduct = comparisons[0];
  if (topProduct) {
    insights.push({
      icon: '🏆',
      title: 'Top Performer',
      description: `${topProduct.productName} is the top-selling product with ${formatCurrency(topProduct.totalSales)} in total sales.`,
    });
  }

  // Highest growth product
  const highestGrowth = comparisons.length > 0
    ? comparisons.reduce((max, p) => (p.growth > max.growth ? p : max))
    : undefined;

  if (highestGrowth && highestGrowth.growth > 0) {
    insights.push({
      icon: '🚀',
      title: 'Fastest Growing',
      description: `${highestGrowth.productName} recorded the highest growth at +${highestGrowth.growth.toFixed(1)}%.`,
    });
  }

  // Declining products
  const declining = comparisons.filter(c => c.growth < 0);
  if (declining.length > 0) {
    const worst = declining[0];
    insights.push({
      icon: '⚠️',
      title: 'Attention Needed',
      description: `${worst.productName} sales declined by ${Math.abs(worst.growth).toFixed(1)}%.`,
    });
  }

  // Total orders insight
  const totalOrders = periods.reduce((sum, p) => sum + p.orders, 0);
  const avgOrders = Math.round(totalOrders / periods.length);
  insights.push({
    icon: '📦',
    title: 'Order Metrics',
    description: `Average of ${avgOrders} orders per period, with a total of ${totalOrders} orders across all periods.`,
  });

  return insights.slice(0, 6); // Limit to 6 insights
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return '₹' + (amount / 1000000).toFixed(2) + 'L';
  }
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2) + 'L';
  }
  if (amount >= 1000) {
    return '₹' + (amount / 1000).toFixed(2) + 'K';
  }
  return '₹' + amount.toFixed(0);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculatePercentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
