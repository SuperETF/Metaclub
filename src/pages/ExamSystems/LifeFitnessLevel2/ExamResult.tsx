// src/pages/ExamSystems/LifeFitnessLevel2/ExamResult.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ExamResult() {
  const [questions, setQuestions] = useState<LF2Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [subjectScores, setSubjectScores] = useState<Record<string, number>>({});
  const navigate = useNavigate();

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
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const totalCorrect = Object.values(subjectScores).reduce((sum, score) => sum + score, 0);
    const average = Math.round((totalCorrect / parsedQuestions.length) * 100);
    const isPassed = average >= 60 && Object.values(subjectScores).every((s) => s >= 8);

    const { data: result, error } = await supabase
      .from("quiz_results")
      .insert([
        {
          user_id: user.id,
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

      <div className="mb-6">
        <p className="text-lg">총 점수: {totalCorrect} / {questions.length}</p>
        <p className="text-lg">평균 점수: {average}%</p>
        <p className={`text-lg font-semibold ${isPassed ? "text-green-600" : "text-red-600"}`}>
          {isPassed ? "✅ 합격입니다!" : "❌ 불합격입니다."}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">과목별 점수</h2>
        <ul>
          {Object.entries(subjectScores).map(([subject, score]) => (
            <li key={subject}>
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
            <div key={q.id} className="border p-4 rounded">
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
                    <input type="radio" name={`review-${q.id}`} value={key} checked={userAnswer === key} readOnly />
                    {q.option_type === "image" ? (
                      <img src={val} alt={`보기 ${key}`} className="w-40" />
                    ) : (
                      <label>{val}</label>
                    )}
                    {key === q.correct_answer && (
                      <span className="ml-2 text-green-600">(정답)</span>
                    )}
                    {key === userAnswer && userAnswer !== q.correct_answer && (
                      <span className="ml-2 text-red-600">(오답)</span>
                    )}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <div className="mt-4 bg-gray-50 p-3 border rounded">
                  <strong>해설:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}