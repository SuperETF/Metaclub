// ✅ src/routes/AppRoutes.tsx

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
import RequireAuth from "./RequireAuth";
import SearchInstitutionPage from "../pages/SearchInstitutionPage";

// ✅ 생체 2급 시험 관련 페이지 import
import LF2ExamStart from "../pages/ExamSystems/LifeFitnessLevel2/ExamStart";
import LF2ExamMain from "../pages/ExamSystems/LifeFitnessLevel2/ExamMain";
import LF2ExamResult from "../pages/ExamSystems/LifeFitnessLevel2/ExamResult";

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
      {/* ✅ 인증 관련 라우트 (Layout 없이) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup/*" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ✅ 공개 라우트 (Layout 포함, 로그인 필요 없음) */}
      <Route element={<LayoutWithTabs />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz/:id" element={<QuizStart />} />
        <Route path="/quiz-result/:resultId" element={<QuizResult />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/search" element={<SearchInstitutionPage />} />

        {/* ✅ 생체 2급 시험 경로 */}
        <Route path="/exam/:examType/start" element={<LF2ExamStart />} />
        <Route path="/exam/:examType/main" element={<LF2ExamMain />} />
        <Route path="/exam/:examType/result/:resultId" element={<LF2ExamResult />} />
      </Route>

      {/* ✅ 보호 라우트 그룹 (Layout + 인증 필요) */}
      <Route element={<RequireAuth><LayoutWithTabs /></RequireAuth>}>
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myposts" element={<MyPostsPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/write/:id" element={<WritePage />} />
        <Route path="/education/write" element={<EducationWrite />} />
      </Route>

      {/* ✅ 루트 경로 리디렉션 */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
