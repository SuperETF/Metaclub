import React from "react";

const ResponsiveContainer = ({ children }) => {
  return (
    <div className="relative w-full max-w-screen-md mx-auto px-4">
      {children}
    </div>
  );
};

export default ResponsiveContainer;
