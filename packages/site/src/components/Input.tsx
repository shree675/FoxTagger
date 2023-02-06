import React from 'react';

const Input = ({
  onInputBlur,
  value,
  setNewValue,
  placeholder,
}: {
  onInputBlur: () => void;
  value: string;
  setNewValue: (newAddress: string) => void;
  placeholder: string;
}) => (
  <input
    value={value}
    onChange={(e) => setNewValue(e.target.value)}
    type="text"
    onBlur={onInputBlur}
    className="text-input"
    placeholder={placeholder}
  />
);

export default Input;
