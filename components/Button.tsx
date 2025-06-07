
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success' | 'warning' | 'primary-gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center border font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-pearl focus:ring-candy/40 transition-all duration-150 ease-in-out transform hover:scale-105";

  // text-white on #C12E77 (candy) is 3.1:1 (ok for large/bold text)
  // text-pearl on #E84057 (cherry-red) is 3.79:1 (ok for button text)
  // text-plum on #FFF4BD (butter-yellow) is 8:1 (ok)
  // text-plum on #C8F9E2 (mint-foam) is 5.7:1 (ok)
  // text-plum on #AEEBFF (mochi) is 6.5:1 (ok)
  const variantStyles = {
    'primary-gradient': 'border-transparent bg-gradient-to-r from-[#FFC1DE] to-candy text-white hover:brightness-110 active:scale-95 shadow-lg', // Special gradient CTA
    primary: 'border-transparent bg-candy/90 text-white hover:bg-candy focus:ring-candy', 
    secondary: 'border-transparent bg-frosted text-plum hover:bg-frosted/70 focus:ring-candy/50 shadow-sm border border-mochi/50',
    danger: 'border-transparent bg-cherry-red text-pearl hover:bg-opacity-80 focus:ring-cherry-red',
    outline: 'border-mochi text-mochi hover:bg-mochi hover:text-plum focus:ring-mochi',
    success: 'border-transparent bg-mint-foam text-plum hover:bg-opacity-80 focus:ring-mint-foam',
    warning: 'border-transparent bg-butter-yellow text-plum hover:bg-opacity-80 focus:ring-butter-yellow'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const disabledStyles = "opacity-60 cursor-not-allowed hover:scale-100";

  const currentVariant = variant === 'primary-gradient' && (disabled || isLoading) ? 'primary' : variant;


  let spinnerColorClass = 'text-plum'; // Default for secondary, outline
  if (currentVariant === 'primary-gradient' || currentVariant === 'primary' || currentVariant === 'danger') {
    spinnerColorClass = 'text-white'; // For primary gradient, primary (candy bg), danger (cherry-red bg)
    if (currentVariant === 'danger') spinnerColorClass = 'text-pearl';
  } else if (currentVariant === 'success' || currentVariant === 'warning') {
    spinnerColorClass = 'text-plum';
  }


  return (
    <button
      className={`${baseStyles} ${variantStyles[currentVariant]} ${sizeStyles[size]} ${(disabled || isLoading) ? disabledStyles : ''} ${className || ''} font-body`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 ${spinnerColorClass}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2 -ml-1 h-4 w-4 sm:h-5 sm:w-5">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2 -mr-1 h-4 w-4 sm:h-5 sm:w-5">{rightIcon}</span>}
    </button>
  );
};

export default Button;