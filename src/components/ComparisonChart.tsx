import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PeriodComparison } from '../types';

interface ComparisonChartProps {
  periodComparisons: PeriodComparison[];
  metric: 'sales' | 'quantity' | 'orders' | 'profit';
  onMetricChange: (metric: 'sales' | 'quantity' | 'orders' | 'profit') => void;
  chartType: 'bar' | 'line';
  onChartTypeChange: (type: 'bar' | 'line') => void;
}

const METRIC_LABELS = {
  sales: 'Sales Amount',
  quantity: 'Quantity Sold',
  orders: 'Number of Orders',
  profit: 'Profit',
};

const METRIC_KEYS = {
  sales: 'sales',
  quantity: 'quantity',
  orders: 'orders',
  profit: 'profit',
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  periodComparisons,
  metric,
  onMetricChange,
  chartType,
  onChartTypeChange,
}) => {
  const hasProfit = periodComparisons.some(p => p.profit !== undefined);
  const data = periodComparisons.map(p => ({
    period: p.period,
    [METRIC_KEYS.sales]: p.sales,
    [METRIC_KEYS.quantity]: p.quantity,
    [METRIC_KEYS.orders]: p.orders,
    [METRIC_KEYS.profit]: p.profit || 0,
  }));

  const getYAxisLabel = () => {
    switch (metric) {
      case 'sales':
        return 'Amount (₹)';
      case 'quantity':
        return 'Units';
      case 'orders':
        return 'Count';
      case 'profit':
        return 'Amount (₹)';
      default:
        return '';
    }
  };

  

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sales Comparison Chart</h2>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {['bar', 'line'].map(type => (
              <button
                key={type}
                onClick={() => onChartTypeChange(type as 'bar' | 'line')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type === 'bar' ? 'Bar' : 'Line'}
              </button>
            ))}
          </div>

          <select
            value={metric}
            onChange={(e) => onMetricChange(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sales">Sales Amount</option>
            <option value="quantity">Quantity</option>
            <option value="orders">Orders</option>
            {hasProfit && <option value="profit">Profit</option>}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" />
            <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              formatter={(value: any) => {
                if (metric === 'sales' || metric === 'profit') {
                  return `₹${Number(value).toLocaleString('en-IN')}`;
                }
                return Number(value).toLocaleString('en-IN');
              }}
            />
            <Legend />
            <Bar dataKey={metric} fill="#0ea5e9" radius={[8, 8, 0, 0]} name={METRIC_LABELS[metric]} />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="period" />
            <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              formatter={(value: any) => {
                if (metric === 'sales' || metric === 'profit') {
                  return `₹${Number(value).toLocaleString('en-IN')}`;
                }
                return Number(value).toLocaleString('en-IN');
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4 }}
              name={METRIC_LABELS[metric]}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
