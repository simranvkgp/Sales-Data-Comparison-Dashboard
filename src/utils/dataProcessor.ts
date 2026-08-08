import type { SalesRecord, ColumnMapping, DataQualityIssue } from '../types';
import { parseISO, isValid } from 'date-fns';

const COLUMN_KEYWORDS = {
  productName: [
    'product', 'book', 'item', 'title', 'name', 'product name',
    'book name', 'item name', 'sku', 'product id'
  ],
  quantity: [
    'quantity', 'qty', 'units', 'unit sold', 'units sold', 'count',
    'volume', 'amount units', 'number of units'
  ],
  salesAmount: [
    'amount', 'sales', 'revenue', 'price', 'total', 'sales amount',
    'sales value', 'total sales', 'total amount', 'value'
  ],
  date: [
    'date', 'sale date', 'sales date', 'order date', 'transaction date',
    'created date', 'timestamp', 'time'
  ],
  category: [
    'category', 'type', 'class', 'group', 'classification', 'segment'
  ],
  orderId: [
    'order', 'order id', 'order number', 'order no', 'invoice', 'invoice id',
    'transaction id', 'reference', 'reference number'
  ],
  customer: [
    'customer', 'customer name', 'buyer', 'client', 'account', 'account name'
  ],
  region: [
    'region', 'territory', 'area', 'zone', 'location', 'city', 'state',
    'country', 'district'
  ],
  salesperson: [
    'salesperson', 'sales person', 'sales rep', 'agent', 'representative',
    'staff', 'employee'
  ],
  discount: [
    'discount', 'discount amount', 'discount %', 'discount percentage',
    'discount value'
  ],
  cost: [
    'cost', 'cost price', 'cost amount', 'purchase cost', 'cogs',
    'cost of goods sold'
  ],
  profit: [
    'profit', 'net profit', 'gross profit', 'earnings', 'margin',
    'net income'
  ],
};

export function detectColumns(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const headerLower = headers.map(h => h.toLowerCase().trim());

  for (const [targetField, keywords] of Object.entries(COLUMN_KEYWORDS)) {
    for (let i = 0; i < headerLower.length; i++) {
      const header = headerLower[i];
      for (const keyword of keywords) {
        if (header.includes(keyword) || keyword.includes(header)) {
          mapping[targetField as keyof ColumnMapping] = headers[i];
          break;
        }
      }
      if (mapping[targetField as keyof ColumnMapping]) break;
    }
  }

  return mapping;
}

export function normalizeRecords(
  rawData: any[],
  columnMapping: ColumnMapping
): { records: SalesRecord[]; issues: DataQualityIssue[] } {
  const records: SalesRecord[] = [];
  const issues: DataQualityIssue[] = [];
  const seenProducts = new Set<string>();
  let missingProducts = 0;
  let invalidQuantities = 0;
  let invalidAmounts = 0;
  let invalidDates = 0;
  const duplicates: string[] = [];
  let emptyRows = 0;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];

    // Check if row is empty
    if (!row || Object.keys(row).length === 0) {
      emptyRows++;
      continue;
    }

    // Get values from row
    const productName = getValue(row, columnMapping.productName);
    const quantity = parseNumber(getValue(row, columnMapping.quantity));
    const salesAmount = parseNumber(getValue(row, columnMapping.salesAmount));

    if (!productName) {
      missingProducts++;
      continue;
    }

    if (quantity === null || quantity < 0) {
      invalidQuantities++;
      continue;
    }

    if (salesAmount === null || salesAmount < 0) {
      invalidAmounts++;
      continue;
    }

    const record: SalesRecord = {
      productName: String(productName).trim(),
      quantity,
      salesAmount,
    };

    // Optional fields
    if (columnMapping.date) {
      const dateVal = getValue(row, columnMapping.date);
      if (dateVal) {
        const parsed = parseDate(dateVal);
        if (parsed) {
          record.date = parsed;
        } else {
          invalidDates++;
        }
      }
    }

    if (columnMapping.category) {
      const val = getValue(row, columnMapping.category);
      if (val) record.category = String(val).trim();
    }

    if (columnMapping.orderId) {
      const val = getValue(row, columnMapping.orderId);
      if (val) record.orderId = String(val).trim();
    }

    if (columnMapping.customer) {
      const val = getValue(row, columnMapping.customer);
      if (val) record.customer = String(val).trim();
    }

    if (columnMapping.region) {
      const val = getValue(row, columnMapping.region);
      if (val) record.region = String(val).trim();
    }

    if (columnMapping.salesperson) {
      const val = getValue(row, columnMapping.salesperson);
      if (val) record.salesperson = String(val).trim();
    }

    if (columnMapping.discount) {
      const val = parseNumber(getValue(row, columnMapping.discount));
      if (val !== null) record.discount = val;
    }

    if (columnMapping.cost) {
      const val = parseNumber(getValue(row, columnMapping.cost));
      if (val !== null) record.cost = val;
    }

    if (columnMapping.profit) {
      const val = parseNumber(getValue(row, columnMapping.profit));
      if (val !== null) record.profit = val;
    }

    // Check for duplicates
    const key = `${record.productName}|${record.quantity}|${record.salesAmount}`;
    if (seenProducts.has(key)) {
      duplicates.push(`Row ${i + 1}: ${record.productName}`);
    } else {
      seenProducts.add(key);
    }

    records.push(record);
  }

  if (missingProducts > 0) {
    issues.push({
      type: 'missingProduct',
      count: missingProducts,
      details: [],
    });
  }

  if (invalidQuantities > 0) {
    issues.push({
      type: 'invalidQuantity',
      count: invalidQuantities,
      details: [],
    });
  }

  if (invalidAmounts > 0) {
    issues.push({
      type: 'invalidAmount',
      count: invalidAmounts,
      details: [],
    });
  }

  if (invalidDates > 0) {
    issues.push({
      type: 'invalidDate',
      count: invalidDates,
      details: [],
    });
  }

  if (duplicates.length > 0) {
    issues.push({
      type: 'duplicate',
      count: duplicates.length,
      details: duplicates,
    });
  }

  if (emptyRows > 0) {
    issues.push({
      type: 'empty',
      count: emptyRows,
      details: [],
    });
  }

  return { records, issues };
}

function getValue(row: any, columnName?: string): any {
  if (!columnName) return undefined;
  return row[columnName];
}

function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    // Remove currency symbols and spaces
    const cleaned = value.replace(/[₹$£€,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  return null;
}

function parseDate(value: any): string | null {
  if (!value) return null;

  let dateStr = value;
  if (typeof value === 'string') {
    dateStr = value.trim();
  } else if (typeof value === 'number') {
    // Excel serial date
    const date = new Date((value - 25569) * 86400 * 1000);
    if (!isValid(date)) return null;
    return date.toISOString().split('T')[0];
  }

  try {
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return dateStr;
    }
  } catch {}

  // Try other common formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Return as ISO string
      return dateStr;
    }
  }

  return null;
}

export function detectPeriodLabel(fileName: string): string {
  // Try to extract period from filename
  const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december'];
  const fileNameLower = fileName.toLowerCase();

  for (const month of months) {
    if (fileNameLower.includes(month)) {
      const year = fileNameLower.match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
    }
  }

  // If no month found, use date from filename or current date
  return `Period ${new Date().toLocaleDateString()}`;
}
