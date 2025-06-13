import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export default function ActionButton({
  onClick,
  disabled = false,
  variant = 'primary',
  children,
  className = ''
}: ActionButtonProps) {
  const baseClasses = "px-4 py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
} 