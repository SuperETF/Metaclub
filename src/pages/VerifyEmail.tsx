// ✅ src/pages/VerifyEmail.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const url = window.location.href.includes("#")
        ? window.location.href.replace("#", "?")
        : window.location.href;

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error || !data.session) {
        toast.error("이메일 인증 실패: 링크가 만료되었거나 잘못되었습니다.");
        navigate("/login", { replace: true });
      } else {
        toast.success("이메일 인증이 완료되었습니다. 로그인해주세요.");
        navigate("/login", { replace: true });
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <p className="text-lg">이메일 인증을 처리 중입니다...</p>
    </div>
  );
};

export default VerifyEmail;