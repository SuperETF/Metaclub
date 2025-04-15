import React from "react";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { label: "전체", value: "all" },
  { label: "자유게시판", value: "free" },
  { label: "문의게시판", value: "question" },
  { label: "정보게시판", value: "info" },
];

const CategoryTabs: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div className="flex space-x-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            selected === cat.value
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
