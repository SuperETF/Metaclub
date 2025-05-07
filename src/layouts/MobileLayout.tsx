import React, { FC, ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout: FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 w-full px-0">
      <div className="w-full sm:max-w-md mx-auto bg-white px-4 py-6 sm:rounded-lg sm:shadow-xl">
        <div className="text-center mb-6">
          <div className="text-indigo-600 text-2xl font-bold">메타 인지 클럽</div>
          <div className="text-gray-500 text-sm">유리한 클래스</div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;
