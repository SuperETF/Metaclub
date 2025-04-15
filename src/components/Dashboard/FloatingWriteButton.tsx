import React from "react";
import { useNavigate } from "react-router-dom";

const FloatingWriteButton: React.FC<{ scrollY: number; selectedCategory: string }> = ({
  scrollY,
  selectedCategory,
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        navigate("/write", {
          state: {
            from: "dashboard",
            scrollY,
            category: selectedCategory,
          },
        })
      }
      className="bg-blue-500 w-14 h-14 rounded-xl text-white shadow-xl flex items-center justify-center hover:bg-blue-600 transition"
    >
      <i className="fas fa-pen text-lg" />
    </button>
  );
};

export default FloatingWriteButton;
