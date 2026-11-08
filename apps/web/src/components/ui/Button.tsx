import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button = ({ children, variant = 'primary', isLoading, className = '', ...props }: ButtonProps) => {
  const baseStyles = 'px-8 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50';
  const variants = {
    primary: 'bg-gradient-to-r from-arena-purple to-arena-blue text-white hover:scale-105 shadow-glow',
    secondary: 'bg-arena-surface2 text-white hover:bg-arena-border',
    outline: 'border border-arena-border text-arena-text2 hover:text-white hover:border-arena-text2',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? 'Processing...' : children}
    </button>
  );
};