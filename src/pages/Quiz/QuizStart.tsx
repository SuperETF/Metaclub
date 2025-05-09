import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

const QuizStart: React.FC = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const user = useUser();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selected: number; isCorrect: boolean }[]
  >([]);

  // ✅ 배열 셔플 함수
  const shuffleArray = <T,>(array: T[]): T[] =>
    [...array].sort(() => Math.random() - 0.5);

  useEffect(() => {
    if (!user && quizId !== "basic") {
      toast.info("이 퀴즈를 풀려면 로그인이 필요합니다.", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  }, [user, quizId, navigate]);

  useEffect(() => {
    if (!quizId) return;
    supabase
      .from("questions")
      .select("id, question, options, correct_answer, explanation")
      .eq("quiz_id", quizId)
      .then(({ data, error }) => {
        if (!error && data) setQuestions(shuffleArray(data));
      });
  }, [quizId]);

  useEffect(() => {
    setTimeLeft(20);
    setShowResult(false);
    setSelectedOption(null);
  }, [currentIndex]);

  useEffect(() => {
    if (showResult) return;
    if (timeLeft <= 0) {
      setShowResult(true);
      setIsCorrect(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showResult]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex + 1 === questions.length;

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    const correct = idx === currentQuestion.correct_answer;
    setSelectedOption(idx);
    setIsCorrect(correct);
    setShowResult(true);
    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selected: idx, isCorrect: correct },
    ]);
    if (correct) setCorrectCount((c) => c + 1);
  };

  const saveQuizResult = async (status: "completed" | "aborted") => {
    if (!user || !quizId) return null;
    const result = await supabase
      .from("quiz_results")
      .insert([
        {
          user_id: user.id,
          quiz_id: quizId,
          score: correctCount,
          total: questions.length,
          answered: currentIndex + 1,
          status,
        },
      ])
      .select()
      .single();
    if (result.error || !result.data?.id) return null;

    const items = userAnswers.map((ua) => ({
      result_id: result.data.id,
      question_id: ua.questionId,
      user_answer:
        questions.find((q) => q.id === ua.questionId)?.options[ua.selected] ||
        "",
      is_correct: ua.isCorrect,
    }));
    await supabase.from("quiz_result_items").insert(items);
    return result.data.id;
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
  };

  const handleFinish = async () => {
    if (!user) {
      toast.info("비회원은 기록이 저장되지 않습니다.");
      return navigate("/dashboard");
    }
    const id = await saveQuizResult("completed");
    if (id) navigate(`/quiz-result/${id}`);
    else toast.error("결과 저장에 실패했습니다.");
  };

  const handleQuit = async () => {
    if (!user) {
      toast.info("비회원은 기록이 저장되지 않습니다.");
      return navigate("/dashboard");
    }
    const id = await saveQuizResult("aborted");
    if (id) navigate(`/quiz-result/${id}`);
  };

  if (!currentQuestion) {
    return (
      <div className="pt-32 text-center text-gray-500">
        문제를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 min-h-screen w-full max-w-screen-sm mx-auto pt-24 pb-12 px-4">
      <div className="fixed top-14 left-0 right-0 bg-white shadow-sm z-10 px-4">
        <div className="max-w-screen-sm mx-auto flex justify-between items-center py-3">
          <div className="text-xl font-bold">
            문제 {currentIndex + 1} / {questions.length}
          </div>
          <div className="bg-red-100 px-3 py-1.5 rounded-full text-red-600 font-bold flex items-center">
            <i className="fas fa-clock mr-2"></i>
            {timeLeft}s
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200">
          <div
            className="bg-indigo-500 h-2 transition-all duration-1000"
            style={{ width: `${(timeLeft / 20) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-indigo-600 text-sm mb-2">객관식</p>
          <h2 className="text-lg font-semibold text-gray-800">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition shadow-sm hover:scale-105 ${
                selectedOption === idx
                  ? isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-white"
              } ${showResult ? "pointer-events-none" : ""}`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + idx)}. {opt}
              </span>
            </button>
          ))}
        </div>

        {showResult ? (
          <div className="mt-6 space-y-4">
            <button
              onClick={isLast ? handleFinish : handleNext}
              className={`w-full text-center py-4 rounded-lg font-semibold shadow-sm transition ${
                isCorrect
                  ? "text-green-700 bg-green-100 hover:bg-green-200"
                  : "text-red-700 bg-red-100 hover:bg-red-200"
              }`}
            >
              {isCorrect ? "정답입니다! 다음 문제" : "틀렸습니다. 다음 문제"}
            </button>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-1 text-gray-800">해설</h3>
              <p className="text-sm text-gray-700">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleQuit}
              className="text-sm text-red-500 underline"
            >
              그만 풀기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizStart;
