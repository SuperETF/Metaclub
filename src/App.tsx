// ✅ src/App.tsx (프로필 insert 제거 및 인증 페이지 보호 최종 반영)
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
    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    const isCallbackFlow = ["signup", "recovery"].includes(type ?? "");

    if (user && isAuthPage && !isCallbackFlow) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, location, navigate]);

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
