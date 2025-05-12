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
  const { isLoading, session } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    const isVerifiedFlow = location.search.includes("verified=true");
    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    const isCallbackFlow = ["signup", "recovery"].includes(type ?? "");

    if (
      !isLoading &&
      user &&
      session &&
      user.email_confirmed_at &&
      isAuthPage &&
      !isCallbackFlow &&
      !isVerifiedFlow
    ) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, session, isLoading, location, navigate]);

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
