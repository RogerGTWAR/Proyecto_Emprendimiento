import React from 'react';

const IconButton = ({
children,
variant = 'primary',
className = '',
loading = false,
...props
}) => {
const baseClasses ='px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';

const variants = {
    primary: 'bg-[#209E7F] hover:bg-[#32C3A2] text-white focus:ring-[#32C3A2]',
    secondary: 'bg-[#D1D5DB] hover:bg-[#c2c7cd] text-[#1E1E1E] focus:ring-[#c2c7cd]',
    outline: 'border border-[#209E7F] text-[#209E7F] hover:bg-[#209E7F] hover:text-white focus:ring-[#209E7F]',
    social: 'bg-white border border-[#D1D5DB] text-[#4B5563] hover:bg-[#F5F7FA] focus:ring-[#3B6DB3]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    blue: 'bg-[#3B6DB3] hover:bg-[#2D4E7A] text-white focus:ring-[#2D4E7A]',
};

  // Estilo para el icono de lupa como background SVG inline
const lupaBackground = `url("data:image/svg+xml,%3csvg fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='11' cy='11' r='8'/%3e%3cline x1='21' y1='21' x2='16.65' y2='16.65'/%3e%3c/svg%3e")`;

return (
<button
    className={`${baseClasses} ${variants[variant]} ${className} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    disabled={loading}
    style={{
        backgroundImage: lupaBackground,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '1.25rem 1.25rem', // tamaño del icono
        paddingLeft: children ? '2.5rem' : '0.75rem', // si hay texto, dejar espacio para icono
    }}
    {...props}
    >
    {loading ? (
        <div className="flex items-center justify-center">
        <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            ></circle>
            <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
        Processing...
        </div>
    ) : (
        children
    )}
    </button>
);
};

export default IconButton;