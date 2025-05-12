import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { getFriendlyError } from "../utils/getFriendlyError";
import { useUser } from "@supabase/auth-helpers-react";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const user = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // ✅ 인증 후 리디렉션되었을 때 toast 표시 및 profiles upsert → /dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const verified = params.get("verified");

    const processVerifiedUser = async () => {
      if (verified === "true" && user) {
        toast.success("✅ 이메일 인증이 완료되었습니다.");

        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          const meta = user.user_metadata;
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            name: meta.name ?? "",
            nickname: meta.nickname ?? "",
            phone: meta.phone ?? "",
            marketing: meta.marketing ?? false,
            agreement: meta.agreement ?? false,
          });
        }

        // URL 파라미터 정리 후 이동
        params.delete("verified");
        navigate("/dashboard", { replace: true });
      }
    };

    processVerifiedUser();
  }, [location.search, user, navigate]);

  // ✅ 자동 로그인 상태인 경우 바로 /dashboard 이동
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(getFriendlyError(error));
      return;
    }
    if (!data.user.email_confirmed_at) {
      toast.warning("❗ 이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
      await supabase.auth.signOut();
      return;
    }
    toast.success("로그인 성공!");
    navigate(from, { replace: true });
  };

  const handleResetRequest = async () => {
    if (!resetEmail) {
      toast.error("이메일을 입력해주세요.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(getFriendlyError(error));
    } else {
      setResetSent(true);
      toast.success("재설정 링크를 이메일로 보냈습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-sm text-gray-400">유리한 클래스</h2>
          <h1 className="text-2xl font-extrabold text-indigo-600">메타 인지 클럽</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="이메일 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
          >
            로그인
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <button
            onClick={() => {
              setShowResetModal(true);
              setResetEmail("");
              setResetSent(false);
            }}
          >
            비밀번호 재설정
          </button>
          <button onClick={() => navigate("/signup")}>회원가입</button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">비밀번호 재설정</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {!resetSent ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  가입하신 이메일 주소를 입력하면 재설정 링크를 보내드립니다.
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="이메일을 입력하세요"
                />
                <button
                  onClick={handleResetRequest}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  링크 보내기
                </button>
              </>
            ) : (
              <div className="text-center">
                <p className="mb-4">{resetEmail}로 링크를 보냈습니다.</p>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
