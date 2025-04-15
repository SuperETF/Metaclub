// src/layouts/PageLayout.tsx
import React from "react";
import Header from "../components/Dashboard/Header";

interface PageLayoutProps {
  children: React.ReactNode;
  paddingTop?: string; // optional override (default: pt-20)
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, paddingTop = "pt-20" }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`${paddingTop} pb-20 px-4`}>{children}</main>
    </div>
  );
};

export default PageLayout;