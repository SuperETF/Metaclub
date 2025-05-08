// ✅ src/components/Dashboard/HotPosts.tsx (모바일-웹 반응형 최종 개선)
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
    <div className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-4">
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
            <p className="text-sm md:text-base text-gray-800 font-medium truncate w-10/12">
              {post.title}
            </p>
            <div className="flex items-center text-gray-400 text-xs md:text-sm">
              <i className="far fa-eye mr-1"></i>
              <span>{post.views.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotPosts;
