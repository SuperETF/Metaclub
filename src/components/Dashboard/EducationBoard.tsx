import React, { useEffect, useState, useRef } from "react";
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

const EducationBoard: React.FC<Props> = ({ category }) => {
  const [items, setItems] = useState<EducationPost[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      let query = supabase
        .from("education_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (!error && data) setItems(data);
    };

    fetchPosts();
  }, [category]);

  // ✅ 마우스 클릭 드래그 스크롤 기능
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const start = (e: MouseEvent) => {
      isDown = true;
      container.classList.add("grabbing");
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const end = () => {
      isDown = false;
      container.classList.remove("grabbing");
    };

    const move = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", start);
    container.addEventListener("mouseleave", end);
    container.addEventListener("mouseup", end);
    container.addEventListener("mousemove", move);

    return () => {
      container.removeEventListener("mousedown", start);
      container.removeEventListener("mouseleave", end);
      container.removeEventListener("mouseup", end);
      container.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div
  ref={scrollRef}
  className="overflow-x-auto scroll-smooth touch-pan-x scrollbar-hide"
>
  <div className="flex gap-4 snap-x snap-mandatory cursor-grab select-none">
    {items.map((item) => (
      <div key={item.id} className="min-w-[250px] flex-shrink-0 bg-gray-50 rounded-lg p-4 snap-start">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-32 object-cover rounded-md mb-2"
            />
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">등록된 정보가 없습니다.</p>
      )}
    </div>
  );
};

export default EducationBoard;