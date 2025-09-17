import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  ...props 
}) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#209E7F] hover:bg-[#32C3A2] text-white focus:ring-[#32C3A2]',
    secondary: 'bg-[#D1D5DB] hover:bg-[#c2c7cd] text-[#1E1E1E] focus:ring-[#c2c7cd]',
    outline: 'border border-[#209E7F] text-[#209E7F] hover:bg-[#209E7F] hover:text-white focus:ring-[#209E7F]',
    social: 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F5F7FA] focus:ring-[#3B6DB3]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    blue: 'bg-[#3B6DB3] hover:bg-[#2D4E7A] text-white focus:ring-[#2D4E7A'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : children}
    </button>
  );
};

export default Button;