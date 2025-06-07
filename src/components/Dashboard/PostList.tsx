import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown, faEye } from "@fortawesome/free-solid-svg-icons";

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
      const { data: rawPosts, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !rawPosts) return;

      const filteredPosts = category === "all"
        ? rawPosts
        : rawPosts.filter((p) => p.category === category);

      const postsWithReactions = await Promise.all(
        filteredPosts.map(async (post) => {
          const { data: reactions } = await supabase
            .from("post_reactions")
            .select("reaction_type")
            .eq("post_id", post.id);

          const likes = reactions?.filter((r) => r.reaction_type === "like").length ?? 0;
          const dislikes = reactions?.filter((r) => r.reaction_type === "dislike").length ?? 0;

          return { ...post, likes, dislikes };
        })
      );

      setPosts(postsWithReactions);
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

  const decodeHtmlEntities = (str: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const stripHtml = (html: string) => {
    const decoded = decodeHtmlEntities(html);
    return decoded
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<img[^>]*alt=".*?"[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\n/g, ' ')
      .trim();
  };

  return (
    <div className="bg-gray-50 space-y-2">

      {/* 🔹 칼럼 작가 신청하기 - 회색 텍스트 링크 */}
      <div className="flex justify-center mt-3">
  <a
    href="https://tally.so/r/nGjx6L" // ← 신청 링크로 교체
    target="_blank"
    rel="noopener noreferrer"
    className="w-full max-w-md text-center bg-gray-100 text-gray-600 text-sm py-2 rounded-md hover:bg-gray-200 transition"
  >
    ✍️ 칼럼 작가 신청하기
  </a>
</div>
      {/* 📰 게시글 목록 */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white w-full px-4 py-3 cursor-pointer"
          onClick={() => navigate(`/post/${post.id}`)}
        >
          <div className="text-sm text-gray-400 mb-1">
            {post.author} · {formatTimeAgo(post.created_at)}
          </div>
          <h3 className="font-semibold text-base text-gray-900 mb-1">
            {post.title}
          </h3>
          <div className="text-sm text-gray-700 line-clamp-2 text-left overflow-hidden break-words">
            {stripHtml(post.content)}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faThumbsUp} /> {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faThumbsDown} /> {post.dislikes}
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faEye} /> {post.views}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
