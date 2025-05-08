// src/layouts/MobileLayout.tsx
import React, { FC, ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="text-indigo-600 text-3xl font-extrabold">메타 인지 클럽</div>
          <div className="text-gray-500 text-sm">유리한 클래스</div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;