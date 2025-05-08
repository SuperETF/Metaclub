// ✅ src/components/Dashboard/HotPosts.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Post {
  id: string;
  title: string;
  views: number;
}

const HotPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchHotPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, views")
        .order("views", { ascending: false })
        .limit(10);

      if (!error && data) {
        setPosts(data);
      } else {
        console.error("🔥 인기글 조회 실패:", error?.message);
      }
    };

    fetchHotPosts();
  }, []);

  const slides = [
    posts.slice(0, 5),   // 1~5위
    posts.slice(5, 10),  // 6~10위
  ];

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 sm:p-5 md:p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold text-gray-900">🔥 인기 게시글 TOP 10</h2>
      </div>

      <div className="overflow-x-auto flex gap-4 scroll-smooth snap-x snap-mandatory">
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className="min-w-full shrink-0 space-y-2 snap-start"
          >
            {slide.map((post, index) => {
              const rank = slideIndex * 5 + index + 1;
              const rankColor = rank <= 3 ? "text-red-500" : "text-green-600";

              return (
                <div
                  key={post.id}
                  className="flex justify-between items-center border-b last:border-none py-2"
                >
                  <div className="flex items-center gap-2 w-10/12">
                    <span className={`text-sm font-bold ${rankColor}`}>
                      {rank}위
                    </span>
                    <p
                      className="truncate text-[15px] font-medium text-gray-800"
                      title={post.title}
                    >
                      {post.title}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <i className="far fa-eye mr-1" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotPosts;
