import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { FileData, ColumnMapping, SalesRecord } from '../types';
import { detectColumns, detectPeriodLabel } from './dataProcessor';

export async function readExcelFile(file: File): Promise<any[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get headers
        const headers = [];
        for (let col = 0; col < 100; col++) {
          const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
          if (!cell) break;
          headers.push(cell.v || `Column${col}`);
        }

        // Get data
        const jsonData: any[] = [];
        for (let row = 1; row < 10000; row++) {
          const rowData: any = {};
          let hasContent = false;

          for (let col = 0; col < headers.length; col++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
            if (cell) {
              rowData[headers[col]] = cell.v;
              hasContent = true;
            }
          }

          if (!hasContent) break;
          jsonData.push(rowData);
        }

        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function readCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parseUploadedFile(file: File): Promise<any[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.csv')) {
    return readCSVFile(file);
  } else if (
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    fileName.endsWith('.xlsm')
  ) {
    return readExcelFile(file);
  } else {
    throw new Error('Unsupported file format. Please use Excel (.xlsx, .xls) or CSV (.csv)');
  }
}

export async function processFileUpload(
  file: File
): Promise<{
  fileName: string;
  label: string;
  originalData: any[];
  headers: string[];
  columnMapping: ColumnMapping;
}> {
  const originalData = await parseUploadedFile(file);

  if (originalData.length === 0) {
    throw new Error('File is empty or contains no data');
  }

  const headers = Object.keys(originalData[0] || {});
  const columnMapping = detectColumns(headers);
  const label = detectPeriodLabel(file.name);

  return {
    fileName: file.name,
    label,
    originalData,
    headers,
    columnMapping,
  };
}

export function exportToExcel(
  dashboardData: {
    summary: any;
    periodComparison: any[];
    productComparison: any[];
    topProducts: any[];
    declineingProducts: any[];
  },
  fileName: string = 'Sales_Comparison_Report.xlsx'
): void {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  if (dashboardData.summary) {
    const summarySheet = XLSX.utils.json_to_sheet([dashboardData.summary]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Period comparison
  if (dashboardData.periodComparison.length > 0) {
    const periodSheet = XLSX.utils.json_to_sheet(dashboardData.periodComparison);
    XLSX.utils.book_append_sheet(workbook, periodSheet, 'Period Comparison');
  }

  // Product comparison
  if (dashboardData.productComparison.length > 0) {
    const productSheet = XLSX.utils.json_to_sheet(dashboardData.productComparison);
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Comparison');
  }

  // Top products
  if (dashboardData.topProducts.length > 0) {
    const topSheet = XLSX.utils.json_to_sheet(dashboardData.topProducts);
    XLSX.utils.book_append_sheet(workbook, topSheet, 'Top Products');
  }

  // Declining products
  if (dashboardData.declineingProducts.length > 0) {
    const declineSheet = XLSX.utils.json_to_sheet(dashboardData.declineingProducts);
    XLSX.utils.book_append_sheet(workbook, declineSheet, 'Declining Products');
  }

  // Write file
  XLSX.writeFile(workbook, fileName);
}

export function createDemoData(): FileData[] {
  const demoFiles: FileData[] = [
    createDemoFileData('January 2026'),
    createDemoFileData('February 2026'),
    createDemoFileData('March 2026'),
  ];

  return demoFiles;
}

function createDemoFileData(period: string): FileData {
  const products = [
    'Mathematics Class 10',
    'Science Class 10',
    'English Class 10',
    'History Class 10',
    'Geography Class 10',
    'Computer Science Class 10',
    'Mathematics Class 12',
    'Physics Class 12',
    'Chemistry Class 12',
    'Biology Class 12',
  ];

  const records: SalesRecord[] = [];

  // Generate demo records
  for (let i = 0; i < 150; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 50) + 5;
    const amount = qty * (Math.floor(Math.random() * 300) + 100);
    const category = product.includes('12') ? 'Class 12' : 'Class 10';

    records.push({
      productName: product,
      quantity: qty,
      salesAmount: amount,
      date: `2026-${period.includes('January') ? '01' : period.includes('February') ? '02' : '03'}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      category,
      profit: Math.floor(amount * 0.4),
      cost: Math.floor(amount * 0.6),
    });
  }

  return {
    fileName: `${period.replace(' ', '_')}_Sales.xlsx`,
    label: period,
    records,
    originalData: records,
    columnMapping: {
      productName: 'productName',
      quantity: 'quantity',
      salesAmount: 'salesAmount',
      date: 'date',
      category: 'category',
      profit: 'profit',
      cost: 'cost',
    },
    dataQualityIssues: [],
  };
}
