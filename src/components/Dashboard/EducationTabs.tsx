import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { label: "전체", value: "all" },
  { label: "웨이트 트레이닝", value: "weight" },
  { label: "재활 트레이닝", value: "rehab" },
  { label: "필라테스", value: "pila" },
  { label: "운동지도", value: "guide" },
  { label: "무료 강의", value: "free" },
];

const EducationTabs: React.FC<Props> = ({ selected, onChange }) => {
  const navigate = useNavigate();
  const user = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";
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
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
      {/* 카테고리 탭들 */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-scroll -mx-2 px-2 scroll-smooth touch-pan-x scrollbar-hide cursor-grab select-none"
      >
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${
              selected === cat.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ✅ 관리자만 보이는 버튼 */}
      {isAdmin && (
        <div className="sm:ml-4">
          <button
            onClick={() => navigate("/education/write")}
            className="px-4 py-1.5 text-sm font-medium bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
          >
            강의 등록
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationTabs;