// src/pages/QuizSelect.tsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";

const QuizSelect: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ex: 'basic'
  const [timer, setTimer] = useState(20); // 기본 20초

  const handleStart = () => {
    navigate(`/quiz/${id}?timer=${timer}`);
  };

  return (
    <PageLayout>
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        <h2 className="text-xl font-bold text-center">제한 시간 선택</h2>
        <p className="text-sm text-gray-600 text-center">
          문제당 제한 시간을 선택하고 퀴즈를 시작하세요.
        </p>

        <div className="space-y-2">
          <label className="block font-medium text-sm">문제당 제한 시간</label>
          <select
            value={timer}
            onChange={(e) => setTimer(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
          >
            <option value={10}>10초</option>
            <option value={20}>20초</option>
            <option value={30}>30초</option>
            <option value={60}>60초</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          퀴즈 시작하기
        </button>
      </div>
    </PageLayout>
  );
};

export default QuizSelect;
