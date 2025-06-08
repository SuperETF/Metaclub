// src/components/common/ResponsiveContainer.tsx
import React from "react";

const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full max-w-screen-md mx-auto px-4">
      {children}
    </div>
  );
};

export default ResponsiveContainer;
