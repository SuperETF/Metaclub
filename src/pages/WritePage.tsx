import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../src/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WritePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = Boolean(id);
  const from = location.state?.from;
  const scrollY = location.state?.scrollY;
  const categoryState = location.state?.category;

  const user = useUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("free");

  useEffect(() => {
    if (isEdit && user?.id) {
      const fetchPost = async () => {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          toast.error("게시글 정보를 불러오지 못했습니다.");
          navigate("/dashboard");
          return;
        }

        if (data.user_id !== user.id) {
          toast.error("본인이 작성한 게시글만 수정할 수 있습니다.");
          navigate("/dashboard");
          return;
        }

        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
      };

      fetchPost();
    }
  }, [id, isEdit, user]);

  const handleSubmit = async () => {
    if (!user) {
      toast.warn("로그인이 필요합니다.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.warn("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (isEdit) {
      const { error } = await supabase
        .from("posts")
        .update({ title, content, category })
        .eq("id", id)
        .eq("user_id", user.id); // ✅ RLS 정책 대응

      if (error) {
        toast.error("게시글 수정에 실패했습니다.");
        console.error("UPDATE 실패:", error.message);
      } else {
        toast.success("게시글이 수정되었습니다 ✏️");
        if (from === "myposts") {
          navigate("/myposts");
        } else {
          navigate("/dashboard", { replace: false, state: { scrollY, category: categoryState } });
        }
      }
    } else {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.nickname) {
        toast.error("닉네임 정보를 불러오지 못했습니다.");
        console.error("닉네임 에러:", profileError?.message);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            category,
            author: profile.nickname,
            user_id: user.id, // ✅ RLS 정책 대응
          },
        ])
        .select()
        .single();

      if (error) {
        toast.error("게시글 등록에 실패했습니다.");
        console.error("INSERT 실패:", error.message);
      } else {
        toast.success("게시글이 등록되었습니다 ✅");
        navigate(`/post/${data.id}`);
      }
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-28">
      <h1 className="text-xl font-bold mb-6">
        {isEdit ? "게시글 수정" : "새 게시글 작성"}
      </h1>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full"
      >
        <option value="free">자유게시판</option>
        <option value="question">문의게시판</option>
        <option value="info">정보게시판</option>
      </select>

      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="border rounded px-3 py-2 mb-4 w-full"
      />

      <button
        onClick={handleSubmit}
        className="btn-primary w-full py-2 font-semibold rounded"
      >
        {isEdit ? "수정 완료" : "등록하기"}
      </button>
    </div>
  );
};

export default WritePage;
