import React, { useRef, useEffect } from "react";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { label: "전체", value: "all" },
  { label: "자유게시판", value: "free" },
  { label: "문의게시판", value: "question" },
  { label: "정보게시판", value: "info" },
  { label: "문제 지적", value: "Complaint" },
];

const CategoryTabs: React.FC<Props> = ({ selected, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const start = (e: MouseEvent) => {
      isDown = true;
      container.classList.add("grabbing");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const end = () => {
      isDown = false;
      container.classList.remove("grabbing");
    };

    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", start);
    container.addEventListener("mouseleave", end);
    container.addEventListener("mouseup", end);
    container.addEventListener("mousemove", move);

    return () => {
      container.removeEventListener("mousedown", start);
      container.removeEventListener("mouseleave", end);
      container.removeEventListener("mouseup", end);
      container.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-scroll scroll-smooth touch-pan-x scrollbar-hide cursor-grab select-none mb-4"
    >
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${
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