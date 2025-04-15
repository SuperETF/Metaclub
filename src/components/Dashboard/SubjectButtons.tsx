// src/components/Dashboard/SubjectButtonList.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Dumbbell, ActivitySquare } from "lucide-react";

const SubjectButtons: React.FC = () => {
  const navigate = useNavigate();

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
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          onClick={() => navigate(`/quiz/${btn.quizId}`)}
          className="bg-white rounded-lg p-3 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div
            className={`flex items-center justify-center ${btn.iconBg} w-9 h-9 rounded-full mb-1.5`}
          >
            {btn.icon}
          </div>
          <p className="text-[10px] text-gray-500 text-center">{btn.description}</p>
          <p className="text-xs font-medium">{btn.title}</p>
        </button>
      ))}
    </div>
  );
};

export default SubjectButtons;