import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: string;
    label?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', icon, error, label, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm placeholder:text-gray-400
              focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all duration-300
              hover:border-brand-300 hover:bg-white
              disabled:cursor-not-allowed disabled:opacity-50
              shadow-sm
              ${icon ? 'pl-11' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
