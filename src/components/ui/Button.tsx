// Button component for reusable buttons across the application

import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  icon: Icon,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;
