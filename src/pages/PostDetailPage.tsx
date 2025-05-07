// ✅ 최종 리팩토링: RLS 대응 + 삭제 제한 + UX 유지
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categoryMap: Record<string, string> = {
  free: "자유게시판",
  question: "문의게시판",
  info: "정보게시판",
};

const PostDetailPage: React.FC = () => {
  const hasTrackedView = useRef(false);
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const refreshPost = async () => {
    const { data } = await supabase.from("posts").select("*").eq("id", id).single();
    if (data) setPost(data);

    if (user) {
      const { data: reaction } = await supabase
        .from("post_reactions")
        .select("reaction_type")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setCurrentReaction(reaction?.reaction_type ?? null);
    }
  };

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;

    const trackView = async () => {
      let anonId: string | null = null;

      if (!user && typeof window !== "undefined") {
        anonId = localStorage.getItem("anon_id");
        if (!anonId) {
          anonId = crypto.randomUUID();
          localStorage.setItem("anon_id", anonId);
        }
      }

      const { error } = await supabase.from("post_views").insert({
        post_id: id,
        user_id: user?.id ?? null,
        anonymous_id: anonId,
      });

      if (error && error.code !== "23505" && error.code !== "409") {
        console.error("❌ 조회수 등록 실패:", error.message);
      }

      await refreshPost();
    };

    trackView();
  }, [id, user]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!user) {
      toast.warn("로그인이 필요한 기능입니다.");
      return;
    }

    if (!post) return;

    if (currentReaction === type) {
      await supabase.from("post_reactions").delete().eq("post_id", id).eq("user_id", user.id);
      setCurrentReaction(null);
    } else {
      if (currentReaction === null) {
        await supabase
          .from("post_reactions")
          .insert({ post_id: id, user_id: user.id, reaction_type: type });
      } else {
        await supabase
          .from("post_reactions")
          .update({ reaction_type: type })
          .eq("post_id", id)
          .eq("user_id", user.id);
      }
      setCurrentReaction(type);
    }

    await refreshPost();
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.warn("로그인이 필요한 기능입니다.");
      return;
    }

    if (!commentText.trim()) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();

      const { error } = await supabase.from("comments").insert([
        {
          post_id: id,
          user_id: user.id,
          nickname: profile?.nickname || "익명",
          content: commentText,
        },
      ]);

      if (!error) {
        setComments((prev) => [
          {
            nickname: profile?.nickname || "익명",
            content: commentText,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setCommentText("");
      }
    } catch (err) {
      console.error("댓글 등록 중 오류:", err);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id); // ✅ 본인 글만 삭제 허용

    if (error) {
      toast.error("게시글 삭제에 실패했습니다.");
      console.error("삭제 실패:", error.message);
    } else {
      toast.success("게시글이 삭제되었습니다 🗑️");
      navigate("/dashboard");
    }
  };

  if (!post) return <div className="pt-28 text-center">로딩 중...</div>;

  return (
    <div className="pt-28 pb-20 px-4 max-w-screen-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-sm text-blue-600 font-medium mb-1">
            {categoryMap[post.category] || post.category}
          </div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>

        {user?.id === post.user_id && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-sm border px-2 py-1 rounded text-gray-600 hover:bg-gray-100"
            >
              더보기
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-28 bg-white shadow rounded text-sm z-10">
                <button
                  className="block w-full px-4 py-2 hover:bg-gray-50 text-left"
                  onClick={() => navigate(`/write/${id}`)}
                >
                  수정하기
                </button>
                <button
                  className="block w-full px-4 py-2 text-red-500 hover:bg-gray-50 text-left"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-4/5 max-w-sm">
            <h3 className="text-lg font-medium mb-3">게시물 삭제</h3>
            <p className="text-gray-600 mb-4">정말로 이 게시물을 삭제하시겠습니까?</p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded text-gray-600"
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={confirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 mb-4">
        {post.author} · {formatDate(post.created_at)}
      </div>

      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        <div className="flex justify-start gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <button
            onClick={() => handleReaction("like")}
            className={`px-3 py-1 rounded ${currentReaction === "like" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            👍 좋아요 {Math.max(post.likes ?? 0, 0)}
          </button>
          <button
            onClick={() => handleReaction("dislike")}
            className={`px-3 py-1 rounded ${currentReaction === "dislike" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            👎 싫어요 {Math.max(post.dislikes ?? 0, 0)}
          </button>
          <span>👁 조회수 {post.views}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-3">댓글 {comments.length}</h2>

        {user ? (
          <div className="flex items-center mb-4">
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={handleAddComment}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              등록
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center mb-4 py-4 border rounded bg-gray-50 text-gray-500 text-sm">
            댓글을 작성하려면
            <button onClick={() => navigate('/login')} className="text-blue-600 underline ml-1">
              로그인
            </button>
            이 필요합니다.
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{comment.nickname}</span>
                <span className="text-gray-400 text-xs">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-800">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
