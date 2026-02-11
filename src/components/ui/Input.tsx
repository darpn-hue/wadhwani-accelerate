import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', icon, error, label, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="block text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:cursor-not-allowed disabled:opacity-50
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
