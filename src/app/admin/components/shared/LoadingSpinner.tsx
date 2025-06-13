import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-500 border-t-transparent"></div>
      <span>{message}</span>
    </div>
  );
} 