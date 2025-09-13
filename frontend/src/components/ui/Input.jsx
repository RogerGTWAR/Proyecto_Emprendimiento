import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-[#1E1E1E]">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#209E7F] focus:border-transparent transition-colors duration-200 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;