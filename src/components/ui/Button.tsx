import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className = '',
    variant = 'primary',
    isLoading = false,
    children,
    disabled,
    ...props
}) => {
    const baseStyles = "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-red-700 text-white hover:bg-red-800 shadow-md hover:shadow-lg",
        outline: "bg-white text-red-700 border-2 border-red-100 hover:border-red-700 hover:bg-red-50",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : children}
        </button>
    );
};
