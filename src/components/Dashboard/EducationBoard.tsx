import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface EducationPost {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
  url?: string;
}

interface Props {
  category: string;
}

const CARD_HEIGHT = 110;
const GAP = 12;
const VISIBLE = 4;
const MAX_HEIGHT = CARD_HEIGHT * VISIBLE + GAP * (VISIBLE - 1); // 516px

const EducationBoard: React.FC<Props> = ({ category }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<EducationPost[]>([]);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from("education_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (category !== "all") {
        q = q.eq("category", category);
      }

      const { data, error } = await q;

      if (!error && data) {
        const filtered = data.filter((item) => item.url); // 외부 링크만
        setItems(filtered);
      }
    })();
  }, [category]);

  return (
    <div className="w-full flex flex-col">
      {/* 콘텐츠 리스트 */}
      <div
        className="overflow-y-auto scrollbar-hide w-full"
        style={{
          maxHeight: `${MAX_HEIGHT}px`,
          paddingRight: "2px",
          paddingBottom: "20px", // 콘텐츠 리스트 아래 여백
        }}
      >
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              등록된 외부 링크가 없습니다.
            </p>
          )}

          {items.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-200"
              style={{ height: `${CARD_HEIGHT}px` }}
            >
              {/* 왼쪽 이미지 */}
              <div className="w-20 h-20 min-w-[80px] rounded bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* 우측 텍스트 */}
              <div className="flex flex-col justify-between overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {item.description || "소개 문구 없음"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 하단 버튼 - 고정 메뉴와 겹치지 않도록 여백 확보 */}
      <div className="w-full mt-6 px-1 pb-[30px]">
        <button
          onClick={() => navigate("/search")}
          className="w-full bg-blue-600 text-white text-sm font-semibold rounded-lg p-3 text-center shadow-md hover:bg-blue-700 transition"
        >
          🔍 대한민국 교육 기관 및 강사 검색하기
        </button>
      </div>
    </div>
  );
};

export default EducationBoard;
