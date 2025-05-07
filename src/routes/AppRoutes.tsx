import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import ResponsiveContainer from "../layouts/ResponsiveContainer";

import Dashboard from "../pages/Dashboard";
import QuizStart from "../pages/Quiz/QuizStart";
import QuizResult from "../pages/Quiz/QuizResult";
import MyPage from "../pages/MyPage";
import EditProfile from "../pages/EditProfile";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import WritePage from "../pages/WritePage";
import PostDetailPage from "../pages/PostDetailPage";
import MyPostsPage from "../pages/MyPostPage";
import Header from "../components/Dashboard/Header";
import EducationWrite from "../pages/EducationWrite";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from '../pages/VerifyEmail';

// ✅ 공통 레이아웃
const LayoutWithTabs = () => (
  <>
    <Header />
    <ResponsiveContainer>
      <Outlet />
    </ResponsiveContainer>
  </>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ✅ 로그인 & 회원가입 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* ✅ 헤더 포함 라우트 그룹 */}
      <Route element={<LayoutWithTabs />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myposts" element={<MyPostsPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/quiz/:id" element={<QuizStart />} />
        <Route path="/quiz-result/:resultId" element={<QuizResult />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/write/:id" element={<WritePage />} />
        <Route path="/education/write" element={<EducationWrite />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* ✅ 기본 경로 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
