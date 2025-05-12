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
  const [img, setImg] = useState<string | null>(null); // img 미리보기용
  const [pendingImgUrl, setPendingImgUrl] = useState<string | null>(null); // 저장 대기 이미지

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("name, nickname, phone, bio, img")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setNickname(data.nickname || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setImg(data.img || null);
      }
    };

    fetchProfile();
  }, [session]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("이미지 업로드 실패: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setPendingImgUrl(data.publicUrl);
  };

  const handleSave = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name, nickname, phone, bio, img: pendingImgUrl ?? img })
      .eq("id", session.user.id);

    if (!error) {
      toast.success("✅ 프로필이 저장되었습니다");
      navigate("/mypage");
    } else {
      toast.error("❌ 저장 실패: " + error.message);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-screen-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-bold mb-4">프로필 수정</h1>

          <p className="text-sm text-gray-600 mb-6">
            * 본인 외에는 이름 및 휴대폰 번호를 조회할 수 없으며, 
            오직 닉네임과 소개글만 확인할 수 있습니다.
          </p>

          <div className="space-y-4">
            {/* 프로필 이미지 */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                <img
                  src={pendingImgUrl || img || "/default-avatar.png"}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                프로필 사진 변경
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">휴대폰 번호</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">소개글</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            저장하기
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default EditProfile;
