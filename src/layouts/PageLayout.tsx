// src/layouts/PageLayout.tsx
import React from "react";
import Header from "../components/Dashboard/Header";

interface PageLayoutProps {
  children: React.ReactNode;
  paddingTop?: string; // optional override (default: pt-20)
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  paddingTop = "pt-20",
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`${paddingTop} pb-20`}>
        {/* 모바일일 때만 전체 회색 배경으로 덮는 래퍼 */}
        <div className="bg-gray-100 sm:bg-transparent">
          <div className="w-full px-4 sm:px-4 md:px-8 space-y-6 sm:space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
