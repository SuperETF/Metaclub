import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

interface Question {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  image?: string;
}

const ExamMain = () => {
  const { examType } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(6000);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isTimerWarning, setIsTimerWarning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subjectCodes = searchParams.get("subjects")?.split(",") ?? [];

  // ✅ 로그인 상태 확인
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center text-gray-700">
        <h1 className="text-xl font-bold mb-2">로그인이 필요합니다</h1>
        <p className="text-sm text-gray-500">이 시험 기능은 로그인 후에 이용할 수 있습니다.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          로그인 하러 가기
        </button>
      </div>
    );
  }

  useEffect(() => {
    const fetchQuestions = async () => {
        const { data, error } = await supabase
        .from("exam_questions_2025")
        .select(`
          id,
          question,
          options,
          correct_answer,
          explanation,
          image:question_image_url
        `)
        .eq("exam_type", examType)
        .in("subject_code", subjectCodes);
      

      if (error) {
        console.error(error);
        setError("문제를 불러오는 데 실패했습니다.");
        setLoading(false);
        return;
      }

      const parsed = data.map((q) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      }));

      setQuestions(parsed);
      setLoading(false);
    };

    fetchQuestions();
  }, [examType, searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 300) setIsTimerWarning(true);
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) =>
    [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
      .map((v) => String(v).padStart(2, "0"))
      .join(":");

  const selectAnswer = (questionId: string, key: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 1) setCurrentQuestion((prev) => prev - 1);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length) setCurrentQuestion((prev) => prev + 1);
  };

  const saveTemporary = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (loading) return <div className="p-4">문제를 불러오는 중입니다...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (questions.length === 0) return <div className="p-4">문제가 존재하지 않습니다.</div>;

  const currentQuestionData = questions[currentQuestion - 1];
  if (!currentQuestionData) return <div className="p-4">문제 데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="fixed w-full top-0 bg-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="text-gray-700">←</div>
          <div className="text-lg font-bold">{examType}</div>
          <div className={`text-base font-medium ${isTimerWarning ? "text-red-600" : "text-gray-700"}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full px-4 py-2 bg-gray-100 flex justify-between items-center">
          <div className="text-sm font-medium">
            문제 {currentQuestion} / {questions.length}
          </div>
          <div className="text-sm text-gray-600">
            {selectedAnswers[currentQuestionData.id] ? "답변 완료" : "미답변"}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-20 px-4">
        <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
              문제 {currentQuestion}
            </span>
          </div>
          <div className="space-y-4">
            <p className="text-base leading-relaxed">{currentQuestionData.question}</p>
            {currentQuestionData.image && (
              <div className="rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={currentQuestionData.image}
                  alt={`문제 ${currentQuestion} 이미지`}
                  className="w-full h-auto object-contain max-h-[200px]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-3">답안을 선택하세요</h3>
          <div className="space-y-3">
            {Object.entries(currentQuestionData.options).map(([key, val]) => (
              <div
                key={key}
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  selectedAnswers[currentQuestionData.id] === key
                    ? "bg-blue-50 border-blue-300"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => selectAnswer(currentQuestionData.id, key)}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full mr-3 ${
                    selectedAnswers[currentQuestionData.id] === key
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {key}
                </div>
                <span className="text-sm">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button onClick={goToPreviousQuestion} disabled={currentQuestion === 1}
              className={`py-3 px-4 rounded-xl shadow-sm ${
                currentQuestion === 1 ? "opacity-50" : "bg-white hover:bg-gray-50"
              }`}>
              이전
            </button>
            <button onClick={goToNextQuestion} disabled={currentQuestion === questions.length}
              className={`py-3 px-4 rounded-xl shadow-sm ${
                currentQuestion === questions.length ? "opacity-50" : "bg-white hover:bg-gray-50"
              }`}>
              다음
            </button>
            <button
  onClick={() => setShowConfirmModal(true)}
  disabled={Object.keys(selectedAnswers).length < questions.length}
  className={`flex items-center justify-center py-3 px-4 rounded-xl shadow-sm transition-all duration-200 ${
    Object.keys(selectedAnswers).length < questions.length
      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700"
  }`}
>
  <i
    className={`fa-solid fa-paper-plane mr-2 ${
      Object.keys(selectedAnswers).length < questions.length ? "text-gray-400" : "text-white"
    }`}
  />
  <span className="text-sm font-medium">
    {Object.keys(selectedAnswers).length < questions.length
      ? `${Object.keys(selectedAnswers).length}/${questions.length}`
      : "제출하기"}
  </span>
</button>

          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={saveTemporary}
            className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
          >
            임시저장
          </button>
        </div>

        {isSaved && (
          <div className="fixed top-20 left-0 right-0 mx-auto w-3/4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-md text-center text-sm">
            답안이 임시 저장되었습니다.
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-5 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-3">답안 제출 확인</h3>
              <p className="text-sm text-gray-600 mb-4">제출 후에는 수정할 수 없습니다. 계속하시겠습니까?</p>
              <div className="flex justify-between items-center mt-4">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                  onClick={() => setShowConfirmModal(false)}>취소</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => (window.location.href = "/quiz-result")}>제출하기</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExamMain;
