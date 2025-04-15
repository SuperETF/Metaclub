// src/components/Dashboard/SubjectButtonList.tsx
import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Dumbbell, ActivitySquare } from "lucide-react";

const SubjectButtons: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const buttons = [
    {
      quizId: "basic",
      title: "기초해부학",
      description: "해부학의 기초를 학습해보세요",
      iconBg: "bg-blue-100",
      icon: <Dumbbell size={16} className="text-blue-500" />,
    },
    {
      quizId: "functional",
      title: "기능해부학",
      description: "움직임 중심 해부학을 배워요",
      iconBg: "bg-yellow-100",
      icon: <ActivitySquare size={16} className="text-yellow-500" />,
    },
    {
      quizId: "neuro",
      title: "신경해부학",
      description: "신경의 지식을 테스트해보세요",
      iconBg: "bg-green-100",
      icon: <BrainCircuit size={16} className="text-green-500" />,
    },
    {
      quizId: "Power",
      title: "문제 수집중",
      description: "문제를 찾습습니다.",
      iconBg: "bg-green-100",
      icon: <BrainCircuit size={16} className="text-green-500" />,
    },
  ];

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
    <div className="overflow-hidden px-4">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth touch-pan-x scrollbar-hide cursor-grab select-none snap-x snap-mandatory pr-10"
      >
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => navigate(`/quiz/${btn.quizId}`)}
            className="bg-white rounded-lg p-3 h-[120px] flex-shrink-0 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer snap-start w-[calc(100vw/3.3)] sm:w-[200px]"
          >
            <div
              className={`flex items-center justify-center ${btn.iconBg} w-9 h-9 rounded-full mb-1.5`}
            >
              {btn.icon}
            </div>
            <p className="text-[10px] text-gray-500 text-center truncate w-full">
              {btn.description}
            </p>
            <p className="text-xs font-medium text-center truncate w-full">
              {btn.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectButtons;