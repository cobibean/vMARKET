import React from 'react';

interface ErrorDisplayProps {
  message: string | null;
  className?: string;
}

export default function ErrorDisplay({ message, className = '' }: ErrorDisplayProps) {
  if (!message) return null;
  
  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
      <p>{message}</p>
    </div>
  );
} 