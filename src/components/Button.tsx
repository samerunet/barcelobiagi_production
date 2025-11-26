'use client';

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  disabled,
  fullWidth,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary-dark text-white hover:bg-text-medium active:bg-text-dark',
    secondary: 'bg-white border border-primary-dark text-primary-dark hover:bg-surface-light',
    ghost: 'bg-transparent text-primary-dark hover:bg-surface-light',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
