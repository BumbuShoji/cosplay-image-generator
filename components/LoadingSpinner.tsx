
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  textColor?: string; 
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, textColor = "text-plum" }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
      <svg 
        className={`animate-spin text-butter-yellow ${sizeClasses[size]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text && <p className={`mt-3 text-lg ${textColor} font-body`}>{text}</p>}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  );
};

export default LoadingSpinner;