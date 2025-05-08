// ✅ src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "../../lib/supabaseClient";
import ResponsiveContainer from "../../layouts/ResponsiveContainer";

const Header: React.FC = () => {
  const user = useUser();
  const { isLoading } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [nickname, setNickname] = useState("마이페이지");

  const isDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    const fetchNickname = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();
      if (data?.nickname) setNickname(data.nickname);
    };

    fetchNickname();
  }, [user]);

  const handleBack = () => {
    if (
      location.pathname.startsWith("/post/") &&
      location.state?.from === "dashboard"
    ) {
      navigate("/dashboard", {
        state: {
          scrollY: location.state.scrollY,
          category: location.state.category,
          from: "post",
        },
      });
    } else {
      navigate(-1);
    }
  };

  const handleProfileClick = () => {
    navigate(user ? "/mypage" : "/login");
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith("/mypage")) return "마이페이지";
    if (location.pathname.startsWith("/quiz")) return "퀴즈";
    if (location.pathname.startsWith("/post/")) return "게시글";
    if (location.pathname.startsWith("/write")) return "글쓰기";
    if (location.pathname.startsWith("/education/write")) return "강의 등록";
    if (location.pathname.startsWith("/quiz-result")) return "퀴즈 결과";
    return "대시보드";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-20 border-b border-gray-100">
      <ResponsiveContainer>
        <div className="flex justify-between items-center px-4 py-3">
          {/* 좌측: 뒤로가기 버튼 + 페이지 타이틀 */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={!isDashboard ? handleBack : undefined}
          >
            {!isDashboard && (
              <i className="fas fa-chevron-left text-gray-700 text-base" />
            )}
            <span className="text-base font-semibold text-gray-800">
              {getPageTitle()}
            </span>
          </div>

          {/* 우측: 로그인/닉네임 */}
          <div className="flex items-center space-x-4 text-gray-500 text-sm">
            <button
              onClick={handleProfileClick}
              className="text-sm text-gray-700 font-medium hover:text-blue-600 transition"
            >
              {!isLoading && user ? nickname : "로그인"}
            </button>
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  );
};

export default Header;
