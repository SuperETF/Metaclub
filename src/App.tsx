// ✅ src/App.tsx

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ BrowserRouter 제거
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

  // ✅ 자동 리디렉션 예외처리 (verify-email, reset-password 방지)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    if (user && type !== "signup" && type !== "recovery") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, location, navigate]);

  // ✅ 최초 로그인 시 1회 프로필 자동 저장
  useEffect(() => {
    const syncProfileIfNeeded = async () => {
      if (!user || !user.email) return;

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing) return;

      const { nickname, name, phone, marketing, agreement } = user.user_metadata || {};

      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          email: user.email,
          name: name || "",
          nickname: nickname || "",
          phone: phone || "",
          bio: "",
          marketing: marketing ?? false,
          agreement: agreement ?? false,
        },
      ]);

      if (error) {
        console.error("❌ profiles insert 실패:", error.message);
      } else {
        console.log("✅ profiles 자동 저장 완료");
      }
    };

    syncProfileIfNeeded();
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

// ✅ BrowserRouter 제거
const App: React.FC = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AppInner />
    </SessionContextProvider>
  );
};

export default App;
