import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type,
  onWheel,
  ...props
}) => {
  // Prevenir alteração de valor ao fazer scroll sobre inputs numéricos
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === 'number') {
      // Prevenir o comportamento padrão de incrementar/decrementar valor
      e.currentTarget.blur();
      e.preventDefault();
      e.stopPropagation();
    }
    onWheel?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
          text-gray-900
          placeholder:text-gray-400 placeholder:opacity-100
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        onWheel={handleWheel}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

