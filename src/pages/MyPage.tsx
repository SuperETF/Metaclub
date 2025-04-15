import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

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

  const deleteUserData = async (userId: string) => {
    try {
      const { data: resultIds } = await supabase
        .from("quiz_results")
        .select("id")
        .eq("user_id", userId);
      const resultIdList = resultIds?.map((r) => r.id) || [];

      if (resultIdList.length > 0) {
        await supabase.from("quiz_result_items").delete().in("result_id", resultIdList);
      }

      await supabase.from("quiz_results").delete().eq("user_id", userId);
      await supabase.from("posts").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);

      console.log("✅ 유저 데이터 전체 삭제 완료");
      return true;
    } catch (err) {
      console.error("❌ 유저 데이터 삭제 실패:", err);
      return false;
    }
  };

  const callDeleteUserFunction = async (userId: string) => {
    const res = await fetch("https://mivnacfecyugbbdwixv.functions.supabase.co/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    });
  
    if (!res.ok) {
      const error = await res.json();
      console.error("❌ 유저 삭제 실패:", error);
      return false;
    }
  
    const result = await res.json();
    return result.success;
  };
  
  
  const handleDeleteAccount = () => {
    confirmAlert({
      title: "회원 탈퇴 확인",
      message: "회원 탈퇴 시 모든 정보가 삭제됩니다. 그래도 회원 탈퇴하시겠습니까?",
      buttons: [
        {
          label: "네, 탈퇴할게요",
          onClick: async () => {
            if (!user) return;
  
            const success = await deleteUserData(user.id);
            if (!success) {
              toast.error("데이터 삭제 중 문제가 발생했습니다.");
              return;
            }
  
            const deleted = await callDeleteUserFunction(user.id);
            if (!deleted) {
              toast.error("계정 삭제에 실패했습니다. 관리자에게 문의해주세요.");
              return;
            }
  
            toast.success("회원 탈퇴가 완료되었습니다.");
            await supabase.auth.signOut();
            navigate("/dashboard");
          },
        },
        {
          label: "아니오",
          onClick: () => {},
        },
      ],
    });
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

        {/* 회원 탈퇴 */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <button
            onClick={handleDeleteAccount}
            className="underline hover:text-red-500 transition"
          >
            회원 탈퇴하기
          </button>
        </div>

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
