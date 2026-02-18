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
    // Premium Base Styles: Smooth transitions, font tracking
    const baseStyles = "w-full py-3.5 px-6 rounded-xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

    const variants = {
        primary: "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 hover:-translate-y-0.5",
        outline: "bg-white text-brand-700 border border-brand-200 hover:border-brand-500 hover:bg-brand-50 shadow-sm hover:shadow-md",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-brand-700"
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
