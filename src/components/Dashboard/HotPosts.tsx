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
        .order("views", { ascending: false }) // ✅ 조회수 기준 정렬
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
    <div className="bg-white rounded-xl p-4 mb-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">인기 게시글</h2>
        <button className="text-sm text-gray-500 flex items-center">
          더보기 <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </button>
      </div>
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className={`flex justify-between items-start pb-3 ${
              idx < posts.length - 1 ? "border-b" : ""
            }`}
          >
            <p className="font-medium text-sm">{post.title}</p>
            <div className="flex items-center text-gray-500 text-xs">
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
