// src/pages/ExamSystems/LifeFitnessLevel2/ExamMain.tsx

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import React from "react";

interface LF2Question {
  id: string;
  subject_code: string;
  question_type: string;
  question: string | null;
  passage?: string;
  question_image_url?: string;
  option_type: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
}

export default function ExamMain() {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<LF2Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(100 * 60); // 100분

  const query = new URLSearchParams(location.search);
  const subjectCodes = query.get("subjects")?.split(",") || [];

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setLoading(true);
      let allQuestions: LF2Question[] = [];
      for (const code of subjectCodes) {
        const { data, error } = await supabase
          .from("lf2_exam_questions")
          .select("*")
          .eq("subject_code", code)
          .order("random()")
          .limit(20);

        if (error) {
          console.error("문제 불러오기 실패:", error);
          continue;
        }
        allQuestions = [...allQuestions, ...(data || [])];
      }
      setQuestions(allQuestions);
      setLoading(false);
    };

    fetchAllQuestions();
  }, [location.search]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId: string, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = () => {
    localStorage.setItem("lf2_answers", JSON.stringify(answers));
    localStorage.setItem("lf2_questions", JSON.stringify(questions));
    navigate("/exam/lf2/result");
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) return <p>문제를 불러오는 중...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">생체 2급 모의고사</h1>
        <span className="text-red-600 font-bold">⏱ {formatTime(timeLeft)}</span>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="mb-6 border rounded p-4">
          <p className="font-medium">
            {index + 1}. {q.passage && <span className="block mb-2">{q.passage}</span>}
            {q.question_type === "image" && q.question_image_url ? (
              <img src={q.question_image_url} alt="문제 이미지" />
            ) : (
              q.question
            )}
          </p>

          <div className="mt-3 grid gap-2">
            {Object.entries(q.options).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={key}
                  checked={answers[q.id] === key}
                  onChange={() => handleAnswer(q.id, key)}
                />
                {q.option_type === "image" ? (
                  <img src={val} alt={`보기 ${key}`} className="w-40" />
                ) : (
                  <label>{val}</label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center">
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">
          제출하기
        </button>
      </div>
    </div>
  );
}
