import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Profiles {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  bio: string;
}

interface QuizResult {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  created_at: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();

  const [profile, setProfile] = useState<Profiles | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("name, nickname, phone, bio")
        .eq("id", userData.user.id)
        .single();

      if (!error && data) setProfile(data as Profiles);
    };

    const fetchQuizResults = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setQuizResults(data || []);
    };

    const fetchUserPosts = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("posts")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPosts(data || []);
    };

    fetchProfile();
    fetchQuizResults();
    fetchUserPosts();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/dashboard");
  };

  const requestAccountDeletion = async () => {
    const { error } = await supabase.from("delete_requests").insert([
      {
        user_id: user?.id,
        reason: reason || null,
      },
    ]);

    if (error) {
      toast.error("탈퇴 요청 중 문제가 발생했습니다.");
      return;
    }

    toast.success("탈퇴 요청이 접수되었습니다. 7일 이내 완전 삭제됩니다.", {
      position: "top-center",
      hideProgressBar: false,
      autoClose: 4000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    await supabase.auth.signOut();
    navigate("/dashboard");
  };

  const confirmAccountDeletion = () => {
    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (confirmed) {
      setShowReasonModal(true);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full px-4 max-w-screen-md">
        {/* 프로필 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-3">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fas fa-user-circle text-4xl text-gray-400"></i>
            </div>
            <div className="ml-4 flex-1">
              <h2 className="font-medium text-lg">{profile?.nickname || "닉네임"}</h2>
              <p className="text-gray-500 text-xs">{profile?.name || "이름"}</p>
              <p className="text-gray-500 text-sm mt-1">
                {profile?.bio || "오늘도 행복한 하루 되세요! 😊"}
              </p>
              <button
                onClick={() => navigate("/edit-profile")}
                className="mt-2 text-xs border border-gray-300 rounded-button px-2 py-1 text-gray-600 cursor-pointer hover:bg-gray-50"
              >
                프로필 편집
              </button>
            </div>
          </div>
        </div>

        {/* 활동 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
          <h3 className="font-medium mb-3">나의 활동</h3>
          <div className="divide-y">
            <div
              className="py-3 flex justify-between items-center cursor-pointer"
              onClick={() => {
                if (quizResults.length > 0) navigate(`/quiz-result/${quizResults[0].id}`);
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <i className="fas fa-code text-blue-500"></i>
                </div>
                <span>최근 푼 문제</span>
                <span className="text-sm text-gray-500 ml-2">{quizResults.length}개</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </div>
            <div
              className="py-3 flex justify-between items-center cursor-pointer"
              onClick={() => navigate("/myposts")}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                  <i className="fas fa-pen text-green-500"></i>
                </div>
                <span>최근 쓴 게시물</span>
                <span className="text-sm text-gray-500 ml-2">{posts.length}개</span>
              </div>
              <i className="fas fa-chevron-right text-gray-400"></i>
            </div>
          </div>
        </div>

        {/* 탈퇴 확인 버튼 */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <button
            onClick={confirmAccountDeletion}
            className="underline hover:text-red-500 transition"
          >
            회원 탈퇴하기
          </button>
        </div>

        {/* 탈퇴 사유 모달 */}
        {showReasonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h2 className="text-lg font-semibold mb-3">탈퇴 사유를 입력해주세요</h2>
              <textarea
                className="w-full border border-gray-300 p-2 rounded mb-4"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="불편한 점이나 아쉬웠던 점이 있다면 남겨주세요"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReasonModal(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    requestAccountDeletion();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 홈으로 돌아가기 */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-3 py-3 bg-white border border-gray-300 text-gray-700 rounded-button font-medium cursor-pointer hover:bg-gray-50"
        >
          홈으로 돌아가기
        </button>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full mt-3 py-3 bg-gray-200 text-gray-700 rounded-button font-medium cursor-pointer hover:bg-gray-300"
        >
          로그아웃
        </button>
      </div>
    </PageLayout>
  );
};

export default MyPage;