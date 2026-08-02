import React, { useState, useEffect } from 'react';

interface FormattedNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const formatNumberVi = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return '';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 4 }).format(num);
};

export const parseNumberVi = (str: string): number => {
  if (!str) return 0;
  // Remove dots (thousands separators in vi-VN) and replace comma with dot for float
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max,
  className = '',
  placeholder = '0',
  disabled = false,
  onKeyDown,
  onFocus,
  onBlur,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => formatNumberVi(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync displayValue when external value prop changes (if not focused)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumberVi(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;

    // Allow digits, dots, and commas
    const filtered = inputStr.replace(/[^0-9.,]/g, '');

    // Calculate numeric value
    let numVal = parseNumberVi(filtered);
    if (max !== undefined && numVal > max) {
      numVal = max;
    }

    // Format display string with thousands separators in real-time
    const parts = filtered.split(',');
    const integerRaw = parts[0].replace(/\./g, '');
    const integerNum = parseInt(integerRaw, 10);
    const formattedInteger = isNaN(integerNum) ? (filtered.startsWith('0') ? '0' : '') : new Intl.NumberFormat('vi-VN').format(integerNum);

    let newDisplay = formattedInteger;
    if (parts.length > 1) {
      newDisplay += ',' + parts[1];
    } else if (filtered.endsWith(',')) {
      newDisplay += ',';
    }

    setDisplayValue(newDisplay);
    onChange(numVal);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    let numVal = parseNumberVi(displayValue);
    if (min !== undefined && numVal < min) numVal = min;
    if (max !== undefined && numVal > max) numVal = max;

    setDisplayValue(formatNumberVi(numVal));
    onChange(numVal);
    if (onBlur) onBlur();
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  );
};
