// ✅ 최종 리팩토링: 댓글 저장, 조회, 수정/삭제, 반응형 및 권한 대응 포함
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ 댓글 불러오기 실패:", error.message);
    } else {
      setComments(data || []);
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
      await loadComments();
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
        await supabase.from("post_reactions").insert({ post_id: id, user_id: user.id, reaction_type: type });
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
        setCommentText("");
        await loadComments();
      }
    } catch (err) {
      console.error("댓글 등록 중 오류:", err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .update({ content: editText })
      .eq("id", commentId)
      .eq("user_id", user?.id);

    if (!error) {
      toast.success("댓글이 수정되었습니다.");
      setEditingCommentId(null);
      setEditText("");
      await loadComments();
    } else {
      toast.error("수정 실패");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user?.id);

    if (!error) {
      toast.success("댓글이 삭제되었습니다.");
      await loadComments();
    } else {
      toast.error("삭제 실패");
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-screen-md mx-auto">
      {post && (
        <div className="mb-6 bg-white p-5 rounded-xl shadow">
          <div className="text-sm text-blue-600 font-medium mb-1">
  {categoryMap[post.category] || post.category}
</div>
<h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="text-sm text-gray-500 mb-3">
            {post.author} · {formatDate(post.created_at)}
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          <div className="flex justify-start gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
            <button
              onClick={() => handleReaction("like")}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition ${currentReaction === "like" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <i className="fas fa-thumbs-up"></i> {Math.max(post.likes ?? 0, 0)}
            </button>
            <button
              onClick={() => handleReaction("dislike")}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition ${currentReaction === "dislike" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <i className="fas fa-thumbs-down"></i> {Math.max(post.dislikes ?? 0, 0)}
            </button>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <i className="fas fa-eye"></i> {post.views}
            </span>
          </div>
        </div>
      )}

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
              {editingCommentId === comment.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border px-2 py-1 rounded flex-1"
                  />
                  <button onClick={() => handleEditComment(comment.id)} className="text-blue-600 text-sm">저장</button>
                  <button onClick={() => setEditingCommentId(null)} className="text-gray-400 text-sm">취소</button>
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
              )}
              {user?.id === comment.user_id && (
                <div className="flex gap-2 mt-1 text-xs text-gray-400">
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditText(comment.content);
                    }}
                  >
                    수정
                  </button>
                  <button onClick={() => handleDeleteComment(comment.id)}>삭제</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
