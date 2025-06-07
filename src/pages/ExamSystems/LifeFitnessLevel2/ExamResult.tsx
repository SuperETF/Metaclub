// src/pages/ExamSystems/LifeFitnessLevel2/ExamResult.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
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

export default function ExamResult() {
  const [questions, setQuestions] = useState<LF2Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    const savedQuestions = localStorage.getItem("lf2_questions");
    const savedAnswers = localStorage.getItem("lf2_answers");

    if (savedQuestions && savedAnswers) {
      const parsedQuestions = JSON.parse(savedQuestions) as LF2Question[];
      const parsedAnswers = JSON.parse(savedAnswers) as Record<string, string>;

      setQuestions(parsedQuestions);
      setAnswers(parsedAnswers);

      const scores: Record<string, number> = {};
      parsedQuestions.forEach((q) => {
        const userAnswer = parsedAnswers[q.id];
        if (!scores[q.subject_code]) scores[q.subject_code] = 0;
        if (userAnswer === q.correct_answer) {
          scores[q.subject_code] += 1;
        }
      });
      setSubjectScores(scores);

      saveResultToSupabase(parsedQuestions, parsedAnswers, scores);
    } else {
      navigate("/exam/lf2");
    }
  }, []);

  const saveResultToSupabase = async (
    parsedQuestions: LF2Question[],
    parsedAnswers: Record<string, string>,
    subjectScores: Record<string, number>
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const totalCorrect = Object.values(subjectScores).reduce((sum, score) => sum + score, 0);
    const average = Math.round((totalCorrect / parsedQuestions.length) * 100);
    const isPassed = average >= 60 && Object.values(subjectScores).every((s) => s >= 8);

    const { data: result } = await supabase
      .from("quiz_results")
      .insert([
        {
          user_id: auth.user.id,
          quiz_id: "lf2",
          score: totalCorrect,
          total: parsedQuestions.length,
          grade: average.toString(),
          passed: isPassed,
        },
      ])
      .select()
      .single();

    if (result) {
      await supabase.from("quiz_result_items").insert(
        parsedQuestions.map((q) => ({
          result_id: result.id,
          user_answer: parsedAnswers[q.id],
          is_correct: parsedAnswers[q.id] === q.correct_answer,
          question: {
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          },
        }))
      );
    }
  };

  const totalCorrect = Object.values(subjectScores).reduce((sum, score) => sum + score, 0);
  const average = Math.round((totalCorrect / (questions.length || 1)) * 100);
  const isPassed = average >= 60 && Object.values(subjectScores).every((s) => s >= 8);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">생체 2급 결과</h1>

      <div className="mb-6 space-y-1">
        <p className="text-lg">총 점수: {totalCorrect} / {questions.length}</p>
        <p className="text-lg">평균 점수: {average}%</p>
        <p className={`text-lg font-semibold ${isPassed ? "text-green-600" : "text-red-600"}`}>
          {isPassed ? "✅ 합격입니다!" : "❌ 불합격입니다."}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">과목별 점수</h2>
        <ul className="space-y-1">
          {Object.entries(subjectScores).map(([subject, score]) => (
            <li key={subject} className="text-sm text-gray-700">
              {subject} : {score} / 20
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correct_answer;

          return (
            <div key={q.id} className="border border-gray-200 p-4 rounded-lg shadow-sm">
              <p className="font-medium mb-2">
                {index + 1}. {q.passage && <span className="block text-sm mb-1">{q.passage}</span>}
                {q.question_type === "image" && q.question_image_url ? (
                  <img src={q.question_image_url} alt="문제 이미지" className="my-2 max-w-full" />
                ) : (
                  q.question
                )}
              </p>

              <div className="mt-3 space-y-2">
                {Object.entries(q.options).map(([key, val]) => (
                  <div key={key} className={`flex items-center p-2 rounded border ${
                    key === userAnswer && key === q.correct_answer
                      ? "bg-green-100 border-green-300"
                      : key === userAnswer
                      ? "bg-red-100 border-red-300"
                      : key === q.correct_answer
                      ? "bg-green-50 border-green-300"
                      : "border-gray-200"
                  }`}>
                    <div
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mr-3 ${
                        key === userAnswer && key === q.correct_answer
                          ? "bg-green-500 text-white"
                          : key === userAnswer
                          ? "bg-red-500 text-white"
                          : key === q.correct_answer
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {key}
                    </div>
                    <span className="text-sm text-gray-800">
                      {q.option_type === "image" ? <img src={val} alt={`보기 ${key}`} className="w-40" /> : val}
                    </span>
                    {key === q.correct_answer && (
                      <span className="ml-auto text-green-600 text-xs font-semibold">정답</span>
                    )}
                    {key === userAnswer && userAnswer !== q.correct_answer && (
                      <span className="ml-auto text-red-600 text-xs font-semibold">오답</span>
                    )}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
                  <strong className="block text-sm text-blue-800 mb-1">해설</strong>
                  <p className="text-xs text-blue-700 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
