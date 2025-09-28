import React from "react";

const CloseButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-200 ${className}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default CloseButton;
