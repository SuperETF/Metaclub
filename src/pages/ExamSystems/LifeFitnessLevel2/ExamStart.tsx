// ExamStart.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const fixedSubjects = [
  { code: "exercise_physiology", name: "운동생리학" },
  { code: "biomechanics", name: "운동역학" },
  { code: "sports_sociology", name: "스포츠사회학" },
  { code: "sports_psychology", name: "스포츠심리학" },
  { code: "korean_sports_history", name: "한국체육사" },
];

export default function ExamStart() {
  const navigate = useNavigate();

  const handleStart = () => {
    const subjectCodes = fixedSubjects.map((s) => s.code).join(",");
    navigate(`/exam/lf2/main?subjects=${subjectCodes}`);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">생체 2급 모의고사</h1>
      <ul className="mb-4">
        {fixedSubjects.map((s) => (
          <li key={s.code} className="text-lg">
            ✅ {s.name}
          </li>
        ))}
      </ul>
      <button onClick={handleStart} className="bg-blue-600 text-white px-4 py-2 rounded">
        시험 시작
      </button>
    </div>
  );
}
