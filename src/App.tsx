// ✅ src/App.tsx (세션 반영 타이밍 보완 + 로그인 후 프로필 자동 등록 추가)
import React, { useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import {
  SessionContextProvider,
  useUser,
  useSessionContext,
} from "@supabase/auth-helpers-react";
import { supabase } from "./lib/supabaseClient";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppInner: React.FC = () => {
  const user = useUser();
  const { isLoading } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 인증된 사용자가 인증 페이지(/login, /signup)에 접근 시 리디렉션
  useEffect(() => {
    if (isLoading) return;

    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    const isCallbackFlow = ["signup", "recovery"].includes(type ?? "");

    if (user && isAuthPage && !isCallbackFlow) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, location, navigate]);

  // ✅ 로그인 후 profiles 자동 등록
  useEffect(() => {
    if (!user || !user.email) return;

    const syncProfile = async () => {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        const { name, nickname, phone, marketing, agreement } = user.user_metadata || {};

        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          name: name || "",
          nickname: nickname || "",
          phone: phone || "",
          marketing: marketing ?? false,
          agreement: agreement ?? false,
        });

        if (error) {
          console.error("[App.tsx] profiles 자동 등록 실패:", error.message);
        } else {
          console.log("✅ profiles 자동 등록 완료");
        }
      }
    };

    syncProfile();
  }, [user]);

  if (isLoading) {
    return <div className="pt-28 text-center">로딩 중...</div>;
  }

  console.log("✅ 현재 유저 ID:", user?.id);

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-center"
        autoClose={1500}
        closeOnClick
        pauseOnHover
        hideProgressBar
        newestOnTop
        draggable
        theme="light"
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </SessionContextProvider>
  );
};

export default App;
