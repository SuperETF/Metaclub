// ✅ src/App.tsx

import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
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

  // ✅ 최초 로그인 시 1회 프로필 자동 저장
  useEffect(() => {
    const syncProfileIfNeeded = async () => {
      if (!user || !user.email) return;

      // 1. 이미 프로필이 있는지 확인
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing) return; // 이미 있으면 패스

      // 2. user_metadata에서 정보 추출
      const { nickname, name, phone, marketing, agreement } = user.user_metadata || {};

      // 3. insert
      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,               // 반드시 auth.uid()와 동일
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
        autoClose={3000}
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
