import React from 'react';

const Input = ({
  onInputBlur,
  value,
  setNewValue,
  placeholder,
  type,
  min,
  step,
}: {
  onInputBlur: () => void;
  value: string;
  setNewValue: (newAddress: string) => void;
  placeholder: string;
  type?: string;
  min?: number;
  step?: number;
}) => (
  <input
    value={value}
    onChange={(e) => setNewValue(e.target.value)}
    onBlur={onInputBlur}
    className="text-input"
    placeholder={placeholder}
    type={type}
    min={min}
    step={step}
  />
);

export default Input;
