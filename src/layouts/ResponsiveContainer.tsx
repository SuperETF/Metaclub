import React from "react";

const ResponsiveContainer = ({ children }) => {
  return (
    <div className="w-full px-4 md:px-10 max-w-[100%] md:max-w-screen-lg mx-auto">
      {children}
    </div>
  );
};

export default ResponsiveContainer;
