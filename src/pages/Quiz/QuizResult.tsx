// src/pages/QuizResult.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import ResponsiveContainer from "../../layouts/ResponsiveContainer";

interface QuizResultItem {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  question: {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  };
}

interface QuizResultData {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  grade?: string;
  created_at: string;
  quiz_result_items?: QuizResultItem[];
}

const quizCategories = [
  { id: "basic", name: "기초해부학" },
  { id: "functional", name: "기능해부학" },
  { id: "neuro", name: "신경해부학" },
];

const QuizResult: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("basic");

  const getGradeAndFeedback = (percent: number) => {
    if (percent >= 90) return { grade: "S", feedback: "최상위 5%! 멋집니다 👏" };
    if (percent >= 80) return { grade: "A", feedback: "상위권입니다! 잘하셨어요 💪" };
    if (percent >= 70) return { grade: "B", feedback: "평균 이상! 계속 도전하세요 😊" };
    if (percent >= 60) return { grade: "C", feedback: "무난한 점수예요. 조금 더!" };
    return { grade: "D", feedback: "조금 아쉽네요! 다시 도전해요 🔥" };
  };

  const fetchResult = async (byId?: string, byCategory?: string) => {
    let raw: any, error: any;

    if (byId) {
      ({ data: raw, error } = await supabase
        .from("quiz_results")
        .select(`
          id,
          quiz_id,
          score,
          total,
          grade,
          created_at,
          quiz_result_items (
            user_answer,
            is_correct,
            question:questions (
              question,
              options,
              correct_answer,
              explanation
            )
          )
        `)
        .eq("id", byId)
        .maybeSingle());
    } else if (byCategory) {
      ({ data: raw, error } = await supabase
        .from("quiz_results")
        .select(`
          id,
          quiz_id,
          score,
          total,
          grade,
          created_at,
          quiz_result_items (
            user_answer,
            is_correct,
            question:questions (
              question,
              options,
              correct_answer,
              explanation
            )
          )
        `)
        .eq("quiz_id", byCategory)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle());
    } else {
      return;
    }

    if (error) {
      console.error("❌ 결과 불러오기 실패:", error.message);
      return;
    }

    const data = raw as QuizResultData | null;
    if (!data) {
      console.warn("⚠️ 결과 없음");
      setResult(null);
      return;
    }

    setResult(data);
    setSelectedCategory(data.quiz_id);
  };

  useEffect(() => {
    if (resultId) fetchResult(resultId, undefined);
  }, [resultId]);

  useEffect(() => {
    if (!resultId || selectedCategory !== result?.quiz_id) {
      fetchResult(undefined, selectedCategory);
    }
  }, [selectedCategory]);

  if (!result || !result.quiz_result_items) {
    return (
      <div className="pt-32 text-center text-gray-500">
        결과를 불러오는 중입니다...
      </div>
    );
  }

  const percent = Math.round((result.score / result.total) * 100);
  const { grade, feedback } = getGradeAndFeedback(percent);

  return (
    <div className="pt-24 pb-32 bg-gray-50 min-h-screen">
      <ResponsiveContainer>
        <h1 className="text-2xl font-bold mb-4 text-center">퀴즈 결과</h1>

        {/* 요약 카드 */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <div className="text-center text-sm text-gray-500 mb-2">
            제출일: {new Date(result.created_at).toLocaleString()}
          </div>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-indigo-600">{percent}%</div>
            <div className="text-lg font-semibold text-gray-800 mt-1">
              등급: {grade}
            </div>
            <p className="text-sm text-gray-600 mt-1">{feedback}</p>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 문제별 결과 */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">문제별 결과</h2>
          <div className="space-y-4">
            {result.quiz_result_items.map((item, idx) => (
              <div key={idx} className="border-b pb-3 last:border-none">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800">
                    문제 {idx + 1}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      item.is_correct ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.is_correct ? "정답" : "오답"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.question.question}</p>
                <p className="text-sm mt-1">
                  <strong className="text-gray-500 mr-1">내 답:</strong>
                  <span
                    className={
                      item.is_correct ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.user_answer}
                  </span>
                </p>
                {!item.is_correct && (
                  <p className="text-sm mt-1">
                    <strong className="text-gray-500 mr-1">정답:</strong>
                    <span className="text-green-600">
                      {item.question.options[item.question.correct_answer]}
                    </span>
                  </p>
                )}
                {showExplanation && item.question.explanation && (
                  <div className="bg-gray-50 text-sm text-gray-600 mt-2 p-2 rounded">
                    {item.question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ResponsiveContainer>

      {/* 고정 푸터 */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 z-20">
        <div className="max-w-screen-md mx-auto px-4 space-y-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 rounded-md"
          >
            {quizCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} 퀴즈
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate(`/quiz/${selectedCategory}`)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            다시 풀기
          </button>

          <button
            onClick={() => setShowExplanation((prev) => !prev)}
            className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold"
          >
            {showExplanation ? "해설 숨기기" : "정답 해설 보기"}
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 text-sm hover:text-blue-600"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
