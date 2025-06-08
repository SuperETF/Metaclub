import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";

interface ExamResult {
  id: string;
  exam_type: string;
  created_at: string;
}

interface Profiles {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  bio: string;
  img?: string;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();

  const [profile, setProfile] = useState<Profiles | null>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<Record<number, ExamResult[]>>({});
  const [showExamModal, setShowExamModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!user) {
      toast.info("로그인이 필요합니다.", { position: "top-center", autoClose: 2000 });
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("name, nickname, phone, bio, img")
      .eq("id", user.id)
      .single()
      .then(({ data }) => data && setProfile(data as Profiles));

    supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setQuizResults(data));

    supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setPosts(data));

    supabase
      .from("exam_results")
      .select("id, exam_type, created_at")
      .eq("user_id", user.id)
      .eq("exam_type", "lf2")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;

        const latestByTypeAndYear = data.reduce((acc, result) => {
          const year = new Date(result.created_at).getFullYear();
          const key = `${year}-${result.exam_type}`;

          if (!acc[key] || new Date(result.created_at) > new Date(acc[key].created_at)) {
            acc[key] = result;
          }

          return acc;
        }, {} as Record<string, ExamResult>);

        const groupedByYear = Object.values(latestByTypeAndYear).reduce((acc, result) => {
          const year = new Date(result.created_at).getFullYear();
          if (!acc[year]) acc[year] = [];
          acc[year].push(result);
          return acc;
        }, {} as Record<number, ExamResult[]>);

        setExamResults(groupedByYear);
      });
  }, [user]);

  const requestAccountDeletion = async () => {
    const { error } = await supabase.from("delete_requests").insert([
      { user_id: user?.id, reason: reason || null },
    ]);
    if (error) return toast.error("탈퇴 요청 중 문제가 발생했습니다.");

    toast.success("탈퇴 요청이 접수되었습니다. 7일 이내 완전 삭제됩니다.", {
      position: "top-center",
      autoClose: 4000,
    });
    await supabase.auth.signOut();
    navigate("/dashboard", { replace: true });
  };

  const confirmAccountDeletion = () => {
    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      setShowReasonModal(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/dashboard", { replace: true });
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full px-4 max-w-screen-md">
        {/* 프로필 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-3">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile?.img ? (
                <img src={profile.img} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user-circle text-4xl text-gray-400"></i>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h2 className="font-medium text-lg">{profile?.nickname || "닉네임"}</h2>
              <p className="text-gray-500 text-xs">{profile?.name || "이름"}</p>
              <p className="text-gray-500 text-sm mt-1">
                {profile?.bio || "오늘도 행복한 하루 되세요! 😊"}
              </p>
              <button
                onClick={() => navigate("/edit-profile")}
                className="mt-2 text-sm bg-white border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition"
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
              onClick={() => quizResults.length > 0 && navigate(`/quiz-result/${quizResults[0].id}`)}
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
              onClick={() => setShowExamModal(true)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                  <i className="fas fa-dumbbell text-yellow-500"></i>
                </div>
                <span>생활체육지도자 시험 결과</span>
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

        {/* 탈퇴 */}
        <div className="mt-6 text-center">
          <button
            onClick={confirmAccountDeletion}
            className="text-sm text-gray-500 hover:text-red-500 underline"
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
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    requestAccountDeletion();
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 홈으로 */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full mt-4 py-3 bg-white border border-gray-300 text-gray-800 rounded hover:bg-gray-100 transition font-medium"
        >
          홈으로 돌아가기
        </button>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full mt-3 py-3 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition font-medium"
        >
          로그아웃
        </button>

        {/* 시험 결과 모달 */}
        {showExamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">생활체육지도자 결과</h2>
              {Object.entries(examResults).length === 0 && (
                <p className="text-sm text-gray-500">아직 응시한 기록이 없습니다.</p>
              )}
              {Object.entries(examResults).map(([year, results]) => (
                <div key={year} className="mb-4">
                  <h3 className="text-base font-bold text-gray-700 mb-2">{year}년도</h3>
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setShowExamModal(false);
                        navigate(`/exam/lf2/result/${r.id}`);
                      }}
                      className="w-full mb-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm text-blue-700 text-left"
                    >
                      {new Date(r.created_at).toLocaleDateString()} 응시 결과 보기
                    </button>
                  ))}
                </div>
              ))}
              <button
                onClick={() => setShowExamModal(false)}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MyPage;
