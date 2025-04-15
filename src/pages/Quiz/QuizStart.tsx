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

  const QUIZ_KEY = `quiz_${quizId}_q${currentIndex}`;

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question, options, correct_answer, explanation")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: true });

      if (!error && data) setQuestions(data);
    };
    fetchQuestions();
  }, [quizId]);

  useEffect(() => {
    if (!quizId || !questions.length) return;

    const now = Date.now();
    const stored = localStorage.getItem(QUIZ_KEY);
    if (!stored) {
      localStorage.setItem(QUIZ_KEY, JSON.stringify({ startTime: now }));
      setTimeLeft(20);
    } else {
      const elapsed = Math.floor((now - JSON.parse(stored).startTime) / 1000);
      setTimeLeft(Math.max(0, 20 - elapsed));
    }
  }, [quizId, currentIndex, questions.length]);

  useEffect(() => {
    if (!showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      setShowResult(true);
      setIsCorrect(false);
    }
  }, [timeLeft, showResult]);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    const correct = index === currentQuestion.correct_answer;
    setSelectedOption(index);
    setIsCorrect(correct);
    setShowResult(true);
    setUserAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, selected: index, isCorrect: correct },
    ]);
    if (correct) setCorrectCount((prev) => prev + 1);
  };

  const saveQuizResult = async (status = "completed"): Promise<string | null> => {
    if (!user || !quizId) return null;

    const resultData = {
      user_id: user.id.toString(),
      quiz_id: quizId,
      score: correctCount,
      total: questions.length,
      answered: currentIndex + 1,
      status,
    };

    const { data, error } = await supabase
      .from("quiz_results")
      .insert([resultData])
      .select()
      .single();

    if (error || !data?.id) {
      console.error("❌ 결과 저장 실패:", error?.message);
      return null;
    }

    const itemData = userAnswers.map((ua) => ({
      result_id: data.id,
      question_id: ua.questionId,
      user_answer: questions.find((q) => q.id === ua.questionId)?.options[ua.selected] ?? "",
      is_correct: ua.isCorrect,
    }));

    const { error: itemError } = await supabase
      .from("quiz_result_items")
      .insert(itemData);
    if (itemError) console.error("❌ 문제 저장 실패:", itemError.message);

    return data.id;
  };

  const handleNext = () => {
    localStorage.removeItem(QUIZ_KEY);
    setSelectedOption(null);
    setShowResult(false);
    setTimeLeft(20);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinish = async () => {
    localStorage.removeItem(QUIZ_KEY);
    if (!user) {
      toast.info("비회원은 푼 기록이 저장되지 않습니다.");
      setTimeout(() => navigate("/dashboard"), 1500);
      return;
    }
    const resultId = await saveQuizResult("completed");
    if (resultId) navigate(`/quiz-result/${resultId}`);
    else toast.error("결과 저장에 실패했습니다.");
  };

  const handleQuit = async () => {
    localStorage.removeItem(QUIZ_KEY);
    if (!user) {
      toast.info("비회원은 푼 기록이 저장되지 않습니다.");
      setTimeout(() => navigate("/dashboard"), 1500);
      return;
    }
    const resultId = await saveQuizResult("aborted");
    if (resultId) navigate(`/quiz-result/${resultId}`);
  };

  if (!currentQuestion) {
    return <div className="pt-32 text-center text-gray-500">문제를 불러오는 중입니다...</div>;
  }

  const isLastQuestion = currentIndex + 1 === questions.length;

  return (
    <div className="relative bg-gray-50 min-h-screen w-full max-w-screen-sm mx-auto pt-24 pb-12 px-4">
      {/* 타이머 헤더 */}
      <div className="fixed top-14 left-0 right-0 bg-white shadow-sm z-10 px-4">
        <div className="max-w-screen-sm mx-auto">
          <div className="flex justify-between items-center py-3">
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
      </div>

      {/* 문제 및 보기 */}
      <div className="mt-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-indigo-600 text-sm mb-2">객관식</p>
          <h2 className="text-lg font-semibold text-gray-800">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition shadow-sm hover:scale-105 ${
                selectedOption === idx
                  ? isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  : "bg-white"
              } ${showResult && "pointer-events-none"}`}
            >
              <span className="font-medium">
                {String.fromCharCode(65 + idx)}. {option}
              </span>
            </button>
          ))}
        </div>

        {/* 결과 & 해설 */}
        {showResult ? (
          <div className="mt-6 space-y-4">
            <button
              onClick={isLastQuestion ? handleFinish : handleNext}
              className={`w-full text-center py-4 rounded-lg font-semibold shadow-sm transition ${
                isCorrect
                  ? "text-green-700 bg-green-100 hover:bg-green-200"
                  : "text-red-700 bg-red-100 hover:bg-red-200"
              }`}
            >
              {isCorrect ? "정답입니다! 다음 문제 풀기" : "틀렸습니다. 다음 문제 풀기"}
            </button>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold mb-1 text-gray-800">해설</h3>
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
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
