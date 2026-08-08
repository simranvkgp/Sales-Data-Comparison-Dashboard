import React from 'react';
import type { ComparisonMetrics, PeriodComparison } from '../types';
import { TrendIndicator } from './TrendIndicator';
import { formatCurrency } from '../utils/analysis';

interface SummaryCardsProps {
  metrics: ComparisonMetrics;
  previousMetrics?: PeriodComparison;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metrics,
  previousMetrics,
}) => {
  const calculateChange = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const cards = [
    {
      title: 'Total Sales',
      value: formatCurrency(metrics.totalSales),
      change: previousMetrics ? calculateChange(metrics.totalSales, previousMetrics.sales) : null,
      icon: '💰',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString(),
      change: previousMetrics ? calculateChange(metrics.totalOrders, previousMetrics.orders) : null,
      icon: '📦',
    },
    {
      title: 'Total Quantity',
      value: metrics.totalQuantity.toLocaleString(),
      change: previousMetrics ? calculateChange(metrics.totalQuantity, previousMetrics.quantity) : null,
      icon: '📊',
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(metrics.averageOrderValue),
      change: previousMetrics ? calculateChange(metrics.averageOrderValue, previousMetrics.aov) : null,
      icon: '💵',
    },
    ...(metrics.totalProfit !== undefined
      ? [{
          title: 'Total Profit',
          value: formatCurrency(metrics.totalProfit),
          change: previousMetrics ? calculateChange(metrics.totalProfit!, previousMetrics.profit || 0) : null,
          icon: '📈',
        }]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
              {card.change !== null && (
                <div className="mt-2">
                  <TrendIndicator change={card.change} />
                </div>
              )}
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
