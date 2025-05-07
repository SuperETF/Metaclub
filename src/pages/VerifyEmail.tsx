// src/pages/VerifyEmail.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // onAuthStateChange 구독
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setStatus("success");
        toast.success("이메일 인증이 완료되었습니다! 2초 후 로그인 화면으로 이동합니다.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (event === "SIGNED_OUT" || !session) {
        setStatus("error");
        toast.error("이메일 인증에 실패했습니다. 유효한 링크인지 확인해주세요.");
      }
      // 기타 이벤트는 무시
    });

    // 언마운트 시 구독 해제
    return () => {
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">이메일 인증 처리 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">인증 실패</h2>
        <p className="text-gray-700 mb-4">인증 링크가 유효하지 않거나 만료되었습니다.</p>
        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          다시 회원가입
        </button>
      </div>
    );
  }

  // status === 'success' 일 때는 리디렉션 중이므로 빈 화면 반환
  return null;
};

export default VerifyEmail;
