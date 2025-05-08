// src/components/common/ResponsiveContainer.tsx
import React from "react";

const ResponsiveContainer = ({ children }) => {
  return (
    <div className="w-full sm:max-w-screen-md sm:mx-auto sm:px-4 px-0">
      {children}
    </div>
  );
};

export default ResponsiveContainer;
