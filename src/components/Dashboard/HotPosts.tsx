// ✅ src/components/Dashboard/HotPosts.tsx (모든 디바이스에서 라운드 유지)
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
        .limit(5);

      if (!error && data) {
        setPosts(data);
      } else {
        console.error("🔥 인기글 조회 실패:", error?.message);
      }
    };

    fetchHotPosts();
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-lg font-bold text-gray-900">🔥 인기 게시글</h2>
        <button className="text-sm md:text-base text-blue-600 font-medium hover:underline">
          더보기
        </button>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex justify-between items-center border-b last:border-none pb-2"
          >
            <p
              className="w-10/12 truncate text-sm md:text-base font-medium text-gray-800"
              title={post.title}
            >
              {post.title}
            </p>
            <div className="flex items-center text-gray-400 text-xs md:text-sm">
              <i className="far fa-eye mr-1" />
              <span>{post.views.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotPosts;
