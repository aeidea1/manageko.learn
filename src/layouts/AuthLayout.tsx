import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-[480px] text-center">
        <h1 className="text-2xl font-bold text-black mb-2">{title}</h1>
        <p className="text-sm text-black mb-8 font-medium">{subtitle}</p>
        
        {children}
      </div>
    </div>
  );
};