import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  views: number;
  likes: number;
  dislikes: number;
}

interface Props {
  category: string;
}

const PostList: React.FC<Props> = ({ category }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (category !== "all") {
        query.eq("category", category);
      }

      const { data, error } = await query;
      if (!error && data) setPosts(data);
    };

    fetchPosts();
  }, [category]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white p-4 rounded-xl shadow-sm cursor-pointer"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <div className="text-sm text-gray-400 mb-1">
            {post.author} · {formatTimeAgo(post.created_at)}
          </div>
          <h3 className="font-semibold text-base mb-1">{post.title}</h3>
          <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-3">
              <span>👍 {post.likes}</span>
              <span>👎 {post.dislikes}</span>
              <span>👁 {post.views}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
