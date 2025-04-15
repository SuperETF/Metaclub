import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

const categories = [
  { label: "전체", value: "all" },
  { label: "웨이트 트레이닝", value: "weight" },
  { label: "재활 트레이닝", value: "rehab" },
  { label: "필라테스", value: "pila" },
  { label: "운동지도", value: "guide" },
  { label: "무료 강의", value: "free" },
];

const EducationTabs: React.FC<Props> = ({ selected, onChange }) => {
  const navigate = useNavigate();
  const user = useUser();
  const isAdmin = user?.user_metadata?.role === "admin";

  return (
    <div className="flex justify-between items-center mb-4">
      {/* 카테고리 탭들 */}
      <div className="flex space-x-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              selected === cat.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ✅ 관리자만 보이는 버튼 */}
      {isAdmin && (
        <button
          onClick={() => navigate("/education/write")}
          className="ml-4 px-4 py-1.5 text-sm font-medium bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
        >
          강의 등록
        </button>
      )}
    </div>
  );
};

export default EducationTabs;
