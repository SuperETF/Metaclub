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

const EducationBoard: React.FC<Props> = ({ category }) => {
  const [items, setItems] = useState<EducationPost[]>([]);

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

  return (
    <div className="overflow-x-auto">
      <div
        className="flex space-x-4 snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[250px] flex-shrink-0 bg-gray-50 rounded-lg p-4 snap-start"
          >
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
