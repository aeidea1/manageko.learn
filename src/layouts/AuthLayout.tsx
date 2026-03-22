import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-[480px]">
        {/* Логотип */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-black tracking-tighter text-[#0056D2]"
          >
            Manageko
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
