import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

interface LF2Question {
  subject_code: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation?: string;
  question_type?: string;
  passage?: string;
  question_image_url?: string;
  option_type?: string;
  question: string;
}

interface LF2ResultItem {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  question: LF2Question;
}

const subjectNameMap: Record<string, string> = {
  sports_sociology: "스포츠사회학",
  sports_pedagogy: "스포츠교육학",
  sports_psychology: "스포츠심리학",
  korean_sports_history: "한국체육사",
  exercise_physiology: "운동생리학",
  biomechanics: "운동역학",
  sports_ethics: "스포츠윤리",
  adaptive_physical_education: "특수체육론",
  early_childhood_physical_education: "유아체육론",
  elderly_physical_education: "노인체육론"
};

export default function ExamResult() {
  const { resultId, examType } = useParams();
  const user = useUser();
  const navigate = useNavigate();

  const [items, setItems] = useState<LF2ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "incorrect">("all");
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!resultId || !user?.id) return;

      const { data, error } = await supabase
        .from("exam_result_items")
        .select("question_id, user_answer, is_correct, question:question_id(*)")
        .eq("result_id", resultId);

      if (error || !data) {
        alert("결과를 불러오지 못했습니다.");
        navigate(`/exam/${examType}`);
        return;
      }

      setItems(data as unknown as LF2ResultItem[]);
      setLoading(false);
    }
    fetch();
  }, [resultId, user, examType, navigate]);

  const subjectScores = items.reduce<Record<string, number>>((map, i) => {
    const code = i.question.subject_code;
    if (!map[code]) map[code] = 0;
    if (i.is_correct) map[code] += 1;
    return map;
  }, {});

  const allSubjects = Array.from(new Set(items.map(i => i.question.subject_code)));

  const subjectCorrectRates = allSubjects.map(subject => {
    const total = items.filter(i => i.question.subject_code === subject).length;
    const correct = items.filter(i => i.question.subject_code === subject && i.is_correct).length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { subject, rate };
  });

  const totalScore = items.filter(i => i.is_correct).length;
  const totalSubjects = Object.keys(subjectScores).length;
  const avgScorePerSubject = totalSubjects > 0 ? totalScore / totalSubjects : 0;
  const meetsPerSubject = Object.values(subjectScores).every(s => s >= 8);
  const meetsTotal = totalScore >= 300 / (items.length / totalSubjects);
  const passed = meetsPerSubject && meetsTotal;

  const incorrectItems = items.filter(i => !i.is_correct);
  const currentItems = activeTab === "incorrect" ? incorrectItems : items;
  const filteredItems = activeSubject ? currentItems.filter(i => i.question.subject_code === activeSubject) : currentItems;

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-6">결과를 불러오는 중입니다...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="fixed w-full top-0 bg-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="text-gray-700 cursor-pointer" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left mr-2" />
          </div>
          <div className="text-lg font-bold">시험 결과</div>
          <div className="text-base font-medium text-gray-700">{examType}</div>
        </div>
      </nav>

      <main className="flex-grow pt-16 pb-20 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 mt-4 text-center">
          <div className={`text-3xl font-bold ${passed ? "text-green-600" : "text-red-600"} mb-2`}>
            {passed ? "합격" : "불합격"}
          </div>
          <div className={`text-sm ${passed ? "text-green-700" : "text-red-700"}`}>
            {passed ? "축하합니다!" : "다음 기회를 노려보세요."}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xl font-bold text-gray-800 mb-1">{items.length}</div>
              <div className="text-sm text-gray-600">전체 문항 수</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xl font-bold text-gray-800 mb-1">{incorrectItems.length}</div>
              <div className="text-sm text-gray-600">오답 문항 수</div>
              
            </div>
            
          </div>
          <div className="text-sm text-gray-600 mt-4 whitespace-pre-line text-left">
            
  {`※ 생활체육지도자 2급 필기시험 합격 기준:
• 과목별 40점 이상
• 전체 평균 60점 이상(총점 300점 이상 합격)`}
</div>
          <div className="mt-4 bg-gray-100 rounded-xl overflow-hidden inline-block w-full">
            <div className="grid grid-cols-2">
              
            </div>
          </div>
        </div>
        {/* 과목별 정답률 시각화 */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">과목별 상세 결과</h3>
          <div className="space-y-4">
            {subjectCorrectRates.map(({ subject, rate }) => (
              <div key={subject} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {subjectNameMap[subject] || subject}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">{rate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 과목별 필터 버튼 */}
        <div className="bg-white rounded-xl shadow-lg mb-4">
          <div className="flex overflow-x-auto p-3 space-x-2">
            {allSubjects.map(subject => (
              <button
                key={subject}
                onClick={() => setActiveSubject(subject === activeSubject ? null : subject)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                  subject === activeSubject
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {subjectNameMap[subject] || subject}
              </button>
            ))}
          </div>
        </div>

        {/* 문제 리스트 렌더링 */}
<div className="space-y-6 mb-6">
  {filteredItems.map((i, idx) => {
    const q = i.question;
    const isExpanded = expandedQuestions.includes(i.question_id);
    return (
      <div key={i.question_id} className="bg-white rounded-xl shadow-lg overflow-hidden border">
        <div
          className="p-4 flex justify-between cursor-pointer"
          onClick={() => toggleQuestion(i.question_id)}
        >
          <div>
            <h4 className="text-sm font-medium">
              문제 {idx + 1} · {subjectNameMap[q.subject_code] || q.subject_code}
            </h4>
            <p className="text-xs text-gray-500">{i.is_correct ? "정답" : "오답"}</p>
          </div>
          <i className={`fas ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-gray-400`} />
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t">
            {/* ✅ <보기> 텍스트 */}
            {q.passage && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm leading-relaxed text-gray-800 space-y-1 mb-4 whitespace-pre-line">
                <p className="text-sm font-medium text-gray-600 mb-1">보기</p>
                {q.passage}
              </div>
            )}

            {/* ✅ 문제 본문 */}
            <p className="text-sm text-gray-800 mb-3 leading-relaxed">{q.question}</p>

            {/* ✅ 문제 이미지 */}
            {q.question_image_url && (
              <img
                src={q.question_image_url}
                alt="문제 이미지"
                className="mb-3 rounded max-h-48 object-contain"
              />
            )}

            {/* ✅ 보기 렌더링 */}
            {Object.entries(q.options).map(([key, val]) => {
              const isUserAnswer = key === i.user_answer;
              const isCorrect = key === q.correct_answer;
              const isWrong = isUserAnswer && !isCorrect;

              const optionStyle =
                isUserAnswer && isCorrect
                  ? "bg-green-50 border-green-300"
                  : isWrong
                  ? "bg-red-50 border-red-300"
                  : isCorrect
                  ? "bg-green-50 border-green-300"
                  : "border-gray-200";

              const badgeStyle =
                isUserAnswer && isCorrect
                  ? "bg-green-500 text-white"
                  : isWrong
                  ? "bg-red-500 text-white"
                  : isCorrect
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600";

              return (
                <div key={key} className={`flex items-start p-3 border rounded-lg mb-2 ${optionStyle}`}>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-sm font-bold ${badgeStyle}`}>
                    {key}
                  </div>
                  <span className="text-sm leading-snug text-gray-800">{val}</span>
                  {isCorrect && <span className="ml-auto text-green-600 text-xs font-semibold">정답</span>}
                  {isWrong && <span className="ml-auto text-red-600 text-xs font-semibold">오답</span>}
                </div>
              );
            })}

            {/* ✅ 해설 */}
            {!i.is_correct && q.explanation && (
              <div className="mt-3 bg-blue-50 p-3 rounded text-xs text-blue-700">
                <strong>해설:</strong> {q.explanation}
              </div>
            )}
          </div>
        )}
      </div>
    );
  })}
</div>

      </main>
    </div>
  );
}
