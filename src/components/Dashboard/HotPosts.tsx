// ✅ src/components/Dashboard/HotPosts.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Post {
  id: string;
  title: string;
  views: number;
  likes: number;
  dislikes: number;
  score: number;
}

const HotPosts: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchHotPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, views, likes, dislikes")
        .order("views", { ascending: false })
        .limit(50);

      if (!error && data) {
        const scored = data.map(post => ({
          ...post,
          score:
            (post.views ?? 0) * 1 +
            (post.likes ?? 0) * 3 -
            (post.dislikes ?? 0) * 2
        }));

        const top30 = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 30);

        setPosts(top30);
      } else {
        console.error("🔥 인기글 조회 실패:", error?.message);
      }
    };

    fetchHotPosts();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 sm:p-5 md:p-6 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold text-gray-900">🔥 인기 게시글 TOP 30</h2>
      </div>

      <div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
        {posts.map((post, index) => {
          const rank = index + 1;
          const rankColor = rank <= 3 ? "text-red-500" : "text-green-600";

          return (
            <div
              key={post.id}
              onClick={() => navigate(`/post/${post.id}`)}
              className="flex items-center border-b last:border-none py-2 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`min-w-[36px] text-sm font-bold ${rankColor}`}>
                  {rank}위
                </span>
                <p
                  className="truncate text-[15px] font-medium text-gray-800"
                  title={post.title}
                >
                  {post.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotPosts;
