import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface EducationPost {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

interface Props {
  category: string;
}

const CARD_HEIGHT = 110;   // 카드 높이(px)
const GAP = 12;            // 간격(px)
const VISIBLE = 4;         // 한 번에 보일 카드 수
const MAX_HEIGHT = CARD_HEIGHT * VISIBLE + GAP * (VISIBLE - 1); // 516px

const EducationBoard: React.FC<Props> = ({ category }) => {
  const [items, setItems] = useState<EducationPost[]>([]);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from("education_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (category !== "all") q = q.eq("category", category);
      const { data, error } = await q;
      if (!error && data) setItems(data);
    })();
  }, [category]);

  return (
    <div
      className="overflow-y-auto scrollbar-hide px-4"
      style={{
        maxHeight: `${MAX_HEIGHT}px`,
        paddingRight: "2px",
      }}
    >
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            등록된 정보가 없습니다.
          </p>
        )}

        {items.map((item) => (
          <a
            key={item.id}
            href={`/education/${item.category}/${item.id}`}
            className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition duration-200"
            style={{ height: `${CARD_HEIGHT}px` }}
          >
            {/* 왼쪽에 고화질 이미지(80×80px) */}
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
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                {item.description || "소개 문구 없음"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EducationBoard;
