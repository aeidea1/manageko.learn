import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`w-full bg-[#0056D2] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-sm transition-colors text-sm ${className}`}
    >
      {children}
    </button>
  );
};