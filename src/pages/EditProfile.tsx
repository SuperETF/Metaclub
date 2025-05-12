import React, { useState, useEffect } from "react";
import PageLayout from "../layouts/PageLayout";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const EditProfile: React.FC = () => {
  const session = useSession();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, nickname, phone, bio, img")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setNickname(data.nickname || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setImgUrl(data.img || "");
      }
    };

    fetchProfile();
  }, [session]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    console.log("🔥 선택된 파일:", file);

    if (!file || !session?.user) {
      toast.error("업로드할 파일을 선택해주세요.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    if (!fileExt) {
      toast.error("파일 확장자를 인식할 수 없습니다.");
      return;
    }

    const filePath = `${session.user.id}.${fileExt}`;
    console.log("📁 저장 경로:", filePath);
    console.log("📦 MIME 타입:", file.type);

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("❌ [Storage 업로드 실패]", uploadError.message);
      toast.error("이미지 업로드 실패: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const imageUrl = publicData?.publicUrl;
    console.log("🌐 생성된 public URL:", imageUrl);

    if (!imageUrl) {
      toast.error("이미지 URL 생성 실패");
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ img: imageUrl })
      .eq("id", session.user.id);

    if (updateError) {
      console.error("❌ [DB 업데이트 실패]", updateError.message);
      toast.error("이미지 등록 실패: " + updateError.message);
    } else {
      console.log("✅ DB 업데이트 완료");
      setImgUrl(imageUrl);
      toast.success("프로필 이미지가 저장되었습니다");
    }

    setUploading(false);
  };

  const handleSave = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name, nickname, phone, bio })
      .eq("id", session.user.id);

    if (!error) {
      toast.success("✅ 프로필이 저장되었습니다");
      navigate("/mypage");
    } else {
      toast.error("❌ 저장 실패: " + error.message);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* 상단 네비게이션 */}
      <div className="fixed top-0 w-full bg-white shadow-sm z-10">
        <div className="px-4 py-3 flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-800">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-base font-semibold ml-4">프로필 수정</h1>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="pt-24 pb-16">
        {/* 프로필 이미지 */}
        <div className="bg-gray-100 py-6 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img
                src={imgUrl || "/default-profile.png"}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-profile.png";
                }}
              />
            </div>
          </div>
          <label className="text-blue-500 font-medium text-sm cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? "업로드 중..." : "프로필 사진 변경"}
          </label>
        </div>

        {/* 프로필 입력 폼 */}
        <div className="mt-6 bg-white rounded-md shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <label className="block text-sm text-gray-500 mb-1">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-base border-none focus:outline-none"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="px-4 py-3 border-b border-gray-100">
            <label className="block text-sm text-gray-500 mb-1">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full text-base border-none focus:outline-none"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div className="px-4 py-3 border-b border-gray-100">
            <label className="block text-sm text-gray-500 mb-1">휴대폰 번호</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-base border-none focus:outline-none"
              placeholder="전화번호를 입력하세요"
            />
          </div>

          <div className="px-4 py-3">
            <label className="block text-sm text-gray-500 mb-1">소개글</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-base border-none focus:outline-none resize-none h-20"
              placeholder="자기소개를 입력하세요"
            />
          </div>
        </div>

        <div className="px-4 mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
