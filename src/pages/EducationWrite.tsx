import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

const EducationPostEditor: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [category, setCategory] = useState("guide");
  const user = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        const newImages = files.map((file) => URL.createObjectURL(file));
        setSelectedImages([...selectedImages, ...newImages]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!title || !content || !category || selectedImages.length === 0) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("education_posts").insert([
      {
        title,
        description: content,
        image_url: selectedImages[0], // 대표 이미지 하나만 저장
        category,
        user_id: user.id,
        author: profile?.nickname || "익명 운영자",
      },
    ]);

    if (error) {
      console.error("등록 실패:", error.message);
      alert("등록에 실패했습니다.");
    } else {
      alert("강의 정보가 등록되었습니다!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 py-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">강의 등록</h1>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          게시하기
        </button>
      </div>

      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-xl font-medium border-b py-2 mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      >
        <option value="guide">운동지도</option>
        <option value="rehab">재활 트레이닝</option>
        <option value="weight">웨이트 트레이닝</option>
        <option value="pila">필라테스</option>
        <option value="general">기타</option>
      </select>

      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      {selectedImages.length > 0 && (
        <img
          src={selectedImages[0]}
          alt="미리보기"
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
      >
        <i className="fas fa-image text-gray-400 text-2xl mb-2"></i>
        <p className="text-gray-600">이미지를 클릭하여 업로드</p>
      </div>
    </div>
  );
};

export default EducationPostEditor;