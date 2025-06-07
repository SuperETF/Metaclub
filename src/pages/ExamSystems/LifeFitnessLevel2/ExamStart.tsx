import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ExamApplicationPage = () => {
  const [selectedExamType, setSelectedExamType] = useState("2급 전문");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const examTypeMap: Record<string, string> = {
    "2급 전문": "lf2",
    "2급 생활": "lf2",
    "2급 장애인": "disabled",
    "유소년": "youth",
    "노인": "senior",
  };

  const examTypes = Object.keys(examTypeMap);

  const subjects = [
    { id: 1, name: "스포츠사회학", code: "sports_sociology", page: 1, type: "선택과목" },
    { id: 2, name: "스포츠교육학", code: "sports_pedagogy", page: 4, type: "선택과목" },
    { id: 3, name: "스포츠심리학", code: "sports_psychology", page: 6, type: "선택과목" },
    { id: 4, name: "한국체육사", code: "korean_sports_history", page: 9, type: "선택과목" },
    { id: 5, name: "운동생리학", code: "exercise_physiology", page: 11, type: "선택과목" },
    { id: 6, name: "운동역학", code: "biomechanics", page: 13, type: "선택과목" },
    { id: 7, name: "스포츠윤리", code: "sports_ethics", page: 16, type: "선택과목" },
    { id: 8, name: "특수체육론", code: "adaptive_physical_education", page: 18, type: "필수과목", requiredFor: "2급 장애인" },
    { id: 9, name: "유아체육론", code: "early_childhood_physical_education", page: 21, type: "필수과목", requiredFor: "유소년" },
    { id: 10, name: "노인체육론", code: "elderly_physical_education", page: 24, type: "필수과목", requiredFor: "노인" },
  ];

  const requiredSubject = subjects.find((s) => s.requiredFor === selectedExamType);
  const maxSelectable = (selectedExamType === "2급 전문" || selectedExamType === "2급 생활") ? 5 : 4;

  const handleSubjectToggle = (id: number) => {
    const subject = subjects.find((s) => s.id === id);
    if (subject?.requiredFor === selectedExamType) return;
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
    } else {
      if (selectedSubjects.length < maxSelectable) {
        setSelectedSubjects([...selectedSubjects, id]);
      }
    }
  };

  const handleNextStep = () => {
    if (requiredSubject && !selectedSubjects.includes(requiredSubject.id)) {
      setToastMessage(`필수 과목인 '${requiredSubject.name}'을 선택해야 합니다.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (selectedSubjects.length !== maxSelectable) {
      setToastMessage(`선택과목을 정확히 ${maxSelectable}개 선택해주세요.`);
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const allSelected = requiredSubject
      ? [...selectedSubjects, requiredSubject.id]
      : selectedSubjects;

    const subjectCodes = allSelected
      .map((id) => subjects.find((s) => s.id === id)?.code)
      .filter(Boolean)
      .join(",");

    const examTypeCode = examTypeMap[selectedExamType];
    navigate(`/exam/${examTypeCode}/main?subjects=${subjectCodes}`);
  };

  const filteredSubjects = subjects.filter(
    (s) => s.type === "선택과목" || s.requiredFor === selectedExamType
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="fixed w-full top-0 bg-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="text-lg font-bold">체육지도자 자격검정</div>
          <button className="text-sm bg-gray-100 px-3 py-1 rounded-full">마이페이지</button>
        </div>
      </nav>

      <main className="flex-grow pt-20 pb-10 px-4">
        <h1 className="text-xl font-bold text-center mb-1">2025년도 2급류 체육지도자</h1>
        <h2 className="text-lg font-bold text-center mb-6">필기시험 원서접수</h2>

        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow relative">
          {toastMessage && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4 text-sm text-white bg-red-600 rounded shadow-xl animate-fade-in">
              {toastMessage}
            </div>
          )}

          <section className="mb-6">
            <h3 className="text-md font-semibold mb-2">응시자 유의사항</h3>
            <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
              <li>시험 당일 신분증을 반드시 지참해야 합니다.</li>
              <li>시험 시작 20분 전까지 입실 완료해 주세요.</li>
              <li>시험 중 전자기기 사용은 부정행위로 간주됩니다.</li>
              <li>검정색 볼펜으로만 답안을 작성하세요.</li>
              <li>시험 종료 후 문제지와 답안지를 모두 제출해야 합니다.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-md font-semibold mb-2">과목 선택 유의사항</h3>
            <ul className="text-sm list-disc list-inside space-y-1 text-gray-700">
              <li>2급 전문/생활 응시자: 선택과목 중 5개 과목 선택 (필수 없음)</li>
              <li>2급 장애인 응시자: 선택 4개 + 필수 '특수체육론'</li>
              <li>유소년 응시자: 선택 4개 + 필수 '유아체육론'</li>
              <li>노인 응시자: 선택 4개 + 필수 '노인체육론'</li>
            </ul>
          </section>

          <section className="mb-6">
            <h3 className="text-md font-semibold mb-2">응시 시험 유형</h3>
            <div className="grid grid-cols-3 gap-2">
              {examTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedExamType(type);
                    const required = subjects.find((s) => s.requiredFor === type);
                    setSelectedSubjects(required ? [required.id] : []);
                  }}
                  className={`px-4 py-2 rounded text-sm border ${
                    selectedExamType === type ? "bg-blue-600 text-white" : "bg-white text-gray-800"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-md font-semibold mb-2">
              과목 선택 ({selectedSubjects.length}/{maxSelectable})
            </h3>
            <ul className="space-y-2">
              {filteredSubjects.map((subject) => (
                <li key={subject.id} className="flex justify-between items-center border p-2 rounded">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      disabled={subject.requiredFor === selectedExamType}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="w-4 h-4 disabled:opacity-50"
                    />
                    <span>{subject.name}</span>
                  </label>
                  <span className="text-xs text-gray-400">{subject.page}면</span>
                </li>
              ))}
            </ul>
          </section>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold"
            onClick={handleNextStep}
          >
            다음 단계로
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExamApplicationPage;
