// ✅ VerifyEmail.tsx 전체 최종 코드 (세션 안정성 강화)
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

      // 1. 인증 코드로 세션 교환
      const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(url);
      if (sessionError || !sessionData.session) {
        toast.error("이메일 인증 실패: 링크가 만료되었거나 잘못되었습니다.");
        navigate("/login", { replace: true });
        return;
      }

      // 2. 세션 안정성 확보 (딜레이 + 재조회)
      await new Promise((res) => setTimeout(res, 500));
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData?.user) {
        toast.error("유저 정보를 불러올 수 없습니다.");
        navigate("/login", { replace: true });
        return;
      }

      const user = userData.user;

      // 3. profiles 테이블에 사용자 존재 여부 확인 후 등록
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || "",
          nickname: user.user_metadata?.nickname || "",
          phone: user.user_metadata?.phone || "",
          marketing: user.user_metadata?.marketing || false,
          agreement: user.user_metadata?.agreement || false,
        });

        if (insertError) {
          toast.error("프로필 등록 실패: " + insertError.message);
          return;
        }
      }

      toast.success("이메일 인증이 완료되었습니다. 로그인해주세요.");
      navigate("/login", { replace: true });
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
