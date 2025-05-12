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
  const [img, setImg] = useState<string | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);

  const AVATAR_URL = "https://mivnacfecycugbbdwixv.supabase.co/storage/v1/object/public/avatars//profile.png";

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

  const handleSave = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        nickname,
        phone,
        bio,
        img: selectedAvatarUrl ?? img,
      })
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
            {/* 프로필 이미지 선택 */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                <img
                  src={selectedAvatarUrl || img || "/default-avatar.png"}
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedAvatarUrl(AVATAR_URL)}
                className="text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50"
              >
                기본 이모티콘 선택
              </button>
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
