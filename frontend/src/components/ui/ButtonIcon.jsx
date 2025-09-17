import React from 'react';
import Button from './Button';

const ButtonIcon = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  icon = null,
  iconPosition = 'left',
  ...props 
}) => {
  const iconElement = icon && React.cloneElement(icon, {
    className: `w-4 h-4 ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`
  });

  return (
    <Button
      variant={variant}
      className={`flex items-center justify-center ${className}`}
      loading={loading}
      {...props}
    >
      {iconPosition === 'left' && iconElement}
      {children}
      {iconPosition === 'right' && iconElement}
    </Button>
  );
};

export default ButtonIcon;