import React, { useEffect, useRef } from "react";
import { useUser } from "@supabase/auth-helpers-react";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { label: "전체", value: "all" },
  { label: "무료 강의", value: "free" },
  { label: "웨이트 트레이닝", value: "weight" },
  { label: "스트렝스", value: "stg" },
  { label: "필라테스", value: "pila" },
  { label: "마인드셋 및 상담", value: "mind" },
  { label: "척추측만증", value: "scoliosis" },
  { label: "물리치료사", value: "physio" },
  { label: "체형 교정", value: "posture" },
  { label: "통증 조절", value: "pain" },
];

const EducationTabs: React.FC<Props> = ({ selected, onChange }) => {
  const user = useUser();
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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
      <div
        ref={scrollRef}
        className="w-full flex gap-2 overflow-x-auto scrollbar-hide touch-pan-x -mx-2 px-2 pb-1 select-none"
      >
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`flex-shrink-0 px-4 py-2 text-sm rounded-full font-medium transition whitespace-nowrap ${
              selected === cat.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EducationTabs;
