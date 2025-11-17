import React from 'react';

interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div
            className={`
              w-11 h-6 rounded-full transition-colors duration-200
              ${checked ? 'bg-blue-600' : 'bg-gray-300'}
            `}
          >
            <div
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
                transition-transform duration-200
                ${checked ? 'transform translate-x-5' : 'transform translate-x-0'}
              `}
            />
          </div>
        </div>
        {label && (
          <span className="ml-3 text-sm text-gray-700">
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

