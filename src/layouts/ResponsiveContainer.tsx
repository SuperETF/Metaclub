import React from "react";

const ResponsiveContainer = ({ children }) => {
  return (
    <div className="w-full px-4 sm:px-6 md:px-0 md:max-w-screen-md mx-auto">
      {children}
    </div>
  );
};


export default ResponsiveContainer;
