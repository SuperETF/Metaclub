// src/pages/EditProfile.tsx
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("name, nickname, phone, bio")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setNickname(data.nickname || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
      }
    };

    fetchProfile();
  }, [session]);

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
    <PageLayout>
      <div className="max-w-screen-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl font-bold mb-6">프로필 수정</h1>

          <div className="space-y-4">
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
