interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded transition-colors duration-200';

  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    success: 'bg-success-500 text-white hover:bg-success-600 border border-success-600',
    danger: 'bg-error-500 text-white hover:bg-error-600 border border-error-600',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
