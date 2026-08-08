import React from 'react';
import type { ColumnMapping } from '../types';

interface ColumnMapperProps {
  fileName: string;
  headers: string[];
  currentMapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const REQUIRED_FIELDS = ['productName', 'quantity', 'salesAmount'];
const OPTIONAL_FIELDS = ['date', 'category', 'orderId', 'customer', 'region', 'salesperson', 'discount', 'cost', 'profit'];

const FIELD_LABELS: { [key: string]: string } = {
  productName: 'Product Name',
  quantity: 'Quantity',
  salesAmount: 'Sales Amount',
  date: 'Date',
  category: 'Category',
  orderId: 'Order ID',
  customer: 'Customer',
  region: 'Region',
  salesperson: 'Salesperson',
  discount: 'Discount',
  cost: 'Cost',
  profit: 'Profit',
};

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  fileName,
  headers,
  currentMapping,
  onMappingChange,
  onConfirm,
  isLoading,
}) => {
  const [tempMapping, setTempMapping] = React.useState(currentMapping);

  const handleMappingChange = (field: string, columnName: string | undefined) => {
    const newMapping = { ...tempMapping };
    if (columnName) {
      newMapping[field as keyof ColumnMapping] = columnName;
    } else {
      delete newMapping[field as keyof ColumnMapping];
    }
    setTempMapping(newMapping);
  };

  const hasRequiredFields = REQUIRED_FIELDS.every(
    (field) => tempMapping[field as keyof ColumnMapping]
  );

  const handleConfirm = () => {
    onMappingChange(tempMapping);
    onConfirm();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Column Mapping - {fileName}
      </h3>

      <div className="space-y-4">
        {/* Required Fields */}
        <div>
          <h4 className="font-semibold text-red-600 text-sm mb-3">Required Fields</h4>
          <div className="space-y-3">
            {REQUIRED_FIELDS.map((field) => (
              <FieldMapper
                key={field}
                fieldName={field}
                fieldLabel={FIELD_LABELS[field]}
                headers={headers}
                currentValue={tempMapping[field as keyof ColumnMapping]}
                onChange={(value) => handleMappingChange(field, value)}
                required
              />
            ))}
          </div>
        </div>

        {/* Optional Fields */}
        <div>
          <h4 className="font-semibold text-gray-600 text-sm mb-3">Optional Fields</h4>
          <div className="space-y-3">
            {OPTIONAL_FIELDS.map((field) => (
              <FieldMapper
                key={field}
                fieldName={field}
                fieldLabel={FIELD_LABELS[field]}
                headers={headers}
                currentValue={tempMapping[field as keyof ColumnMapping]}
                onChange={(value) => handleMappingChange(field, value)}
                required={false}
              />
            ))}
          </div>
        </div>
      </div>

      {!hasRequiredFields && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠️ Please map all required fields (Product Name, Quantity, and Sales Amount) to proceed.
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!hasRequiredFields || isLoading}
        className="mt-6 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Confirm Mapping
      </button>
    </div>
  );
};

interface FieldMapperProps {
  fieldName: string;
  fieldLabel: string;
  headers: string[];
  currentValue?: string;
  onChange: (value: string | undefined) => void;
  required: boolean;
}

const FieldMapper: React.FC<FieldMapperProps> = ({
  fieldLabel,
  headers,
  currentValue,
  onChange,
  required,
}) => {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 w-40">
        {fieldLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={currentValue || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">-- Select Column --</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );
};
