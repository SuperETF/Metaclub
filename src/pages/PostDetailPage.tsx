import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";

import LoanBanner from "../components/Dashboard/LoanBanner";
import FloatingWriteButton from "../components/Dashboard/FloatingWriteButton";
import "react-toastify/dist/ReactToastify.css";

const categoryMap: Record<string, string> = {
  free: "자유게시판",
  question: "문의게시판",
  info: "정보게시판",
  complaint: "문제 오류",
  mind: "오늘도 말해버렸다."
};
const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useUser();
  const navigate = useNavigate();
  const hasTrackedView = useRef(false);

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  const refreshPost = async () => {
    const { data: postData } = await supabase.from("posts").select("*").eq("id", id).single();
    if (postData) {
      const { data: reactions } = await supabase
        .from("post_reactions")
        .select("reaction_type")
        .eq("post_id", id);

      const likes = reactions?.filter(r => r.reaction_type === "like").length || 0;
      const dislikes = reactions?.filter(r => r.reaction_type === "dislike").length || 0;

      setPost({ ...postData, likes, dislikes });
    }

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
    if (!error) setComments(data || []);
  };

  useEffect(() => {
    if (hasTrackedView.current) return;
    hasTrackedView.current = true;
    (async () => {
      let anonId = user?.id ?? null;
      if (!user) {
        anonId = localStorage.getItem("anon_id") || crypto.randomUUID();
        localStorage.setItem("anon_id", anonId);
      }

      const { error: viewError } = await supabase.from("post_views").insert({
        post_id: id,
        user_id: user?.id ?? null,
        anonymous_id: anonId,
      });
      if (viewError && viewError.code !== "23505" && viewError.code !== "409") {
        console.error("조회수 등록 실패:", viewError.message);
      }

      await refreshPost();
      await loadComments();
    })();
  }, [id, user]);
  const handleReaction = async (type: "like" | "dislike") => {
    if (!user) return toast.warn("로그인이 필요합니다.");
    if (!post) return;

    if (currentReaction === type) {
      await supabase.from("post_reactions").delete().eq("post_id", id).eq("user_id", user.id);
      setCurrentReaction(null);
    } else {
      const payload = { post_id: id, user_id: user.id, reaction_type: type };
      if (!currentReaction) {
        await supabase.from("post_reactions").insert(payload);
      } else {
        await supabase.from("post_reactions").update(payload).eq("post_id", id).eq("user_id", user.id);
      }
      setCurrentReaction(type);
    }
    await refreshPost();
  };

  const handleAddComment = async () => {
    if (!user) return toast.warn("로그인이 필요합니다.");
    if (!commentText.trim()) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();
    await supabase.from("comments").insert([{
      post_id: id,
      user_id: user.id,
      nickname: profile?.nickname ?? "익명",
      content: commentText,
    }]);
    setCommentText("");
    await loadComments();
  };

  const handleEditComment = async (cid: string) => {
    await supabase.from("comments").update({ content: editText }).eq("id", cid).eq("user_id", user?.id);
    toast.success("댓글이 수정되었습니다.");
    setEditingCommentId(null);
    setEditText("");
    await loadComments();
  };

  const handleDeleteComment = async (cid: string) => {
    await supabase.from("comments").delete().eq("id", cid).eq("user_id", user?.id);
    toast.success("댓글이 삭제되었습니다.");
    await loadComments();
  };

  const handleEditPost = () => {
    if (post?.user_id !== user?.id) return toast.warn("수정 권한이 없습니다.");
    navigate(`/write/${id}`, {
      state: {
        from: "dashboard",
        scrollY: window.scrollY,
        category: post?.category,
      },
    });
  };

  const handleDeletePost = async () => {
    if (!user) return toast.warn("로그인이 필요합니다.");
    if (post?.user_id !== user.id) return toast.warn("삭제 권한이 없습니다.");
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error("삭제 실패: " + error.message);
    toast.success("게시글이 삭제되었습니다.");
    navigate("/dashboard");
  };

  const scrollY = window.scrollY;
  const selectedCategory = post?.category ?? "free";
  return (
    <>
      <div className="pt-28 pb-20 px-0 md:px-4 md:max-w-screen-md md:mx-auto">
        {post && (
          <div className="mb-6 bg-white p-4 md:p-5 md:rounded-xl md:shadow">
            {user?.id === post.user_id && (
              <div className="flex justify-end gap-2 mb-2">
                <button onClick={handleEditPost} className="text-blue-600 underline text-sm">
                  수정
                </button>
                <button onClick={handleDeletePost} className="text-red-600 underline text-sm">
                  삭제
                </button>
              </div>
            )}

            <div className="text-sm text-blue-600 font-medium mb-1">
              {categoryMap[post.category] ?? post.category}
            </div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="text-sm text-gray-500 mb-3">
              {post.author} · {formatDate(post.created_at)}
            </div>

            <iframe
              title="Post Content"
              className="w-full min-h-[100vh] border-0"
              srcDoc={DOMPurify.sanitize(post.content)}
              sandbox=""
            />

            <div className="flex justify-start gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
              <button
                onClick={() => handleReaction("like")}
                className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition ${
                  currentReaction === "like"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👍 {Math.max(post.likes ?? 0, 0)}
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                className={`flex items-center gap-1 px-3 py-1 rounded font-medium transition ${
                  currentReaction === "dislike"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👎 {Math.max(post.dislikes ?? 0, 0)}
              </button>
              <span className="flex items-center gap-1">👁️ {post.views}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-none md:rounded-xl md:shadow p-4 md:p-5 mb-8">
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
              댓글 작성을 위해
              <button onClick={() => navigate("/login")} className="ml-1 text-blue-600 underline">
                로그인
              </button>
              이 필요합니다.
            </div>
          )}

          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{c.nickname}</span>
                  <span className="text-gray-400 text-xs">{formatDate(c.created_at)}</span>
                </div>

                {editingCommentId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border px-2 py-1 rounded flex-1"
                    />
                    <button onClick={() => handleEditComment(c.id)} className="text-blue-600 text-sm">
                      저장
                    </button>
                    <button onClick={() => setEditingCommentId(null)} className="text-gray-400 text-sm">
                      취소
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
                )}

                {user?.id === c.user_id && (
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <button
                      onClick={() => {
                        setEditingCommentId(c.id);
                        setEditText(c.content);
                      }}
                    >
                      수정
                    </button>
                    <button onClick={() => handleDeleteComment(c.id)}>삭제</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <LoanBanner />
      </div>

      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="w-full px-4 md:px-8 flex justify-end">
          <FloatingWriteButton scrollY={scrollY} selectedCategory={selectedCategory} />
        </div>
      </div>
    </>
  );
};

export default PostDetailPage;
