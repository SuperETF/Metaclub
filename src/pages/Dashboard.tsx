// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useUser } from "@supabase/auth-helpers-react";
import Header from "../components/Dashboard/Header";
import QuizStatusCard from "../components/Dashboard/QuizStatusCard";
import LoanBanner from "../components/Dashboard/LoanBanner";
import HotPosts from "../components/Dashboard/HotPosts";
import EducationBoard from "../components/Dashboard/EducationBoard";
import EducationTabs from "../components/Dashboard/EducationTabs";
import CategoryTabs from "../components/Dashboard/CategoryTabs";
import PostList from "../components/Dashboard/PostList";
import SubjectButtons from "../components/Dashboard/SubjectButtons";
import FloatingWriteButton from "../components/Dashboard/FloatingWriteButton";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eduCategory, setEduCategory] = useState("all");

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }

    if (location.state?.scrollY !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: location.state.scrollY, behavior: "instant" });
      });
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Header />

      <main className="pt-28 pb-20 px-4 max-w-screen-md mx-auto space-y-5">
        <SubjectButtons />
        <QuizStatusCard />
        <LoanBanner />
        <HotPosts />

        <div className="bg-white rounded-2xl shadow px-4 py-6">
          <h2 className="font-bold text-lg mb-3">교육 및 강의 정보</h2>
          <EducationTabs selected={eduCategory} onChange={setEduCategory} />
          <EducationBoard category={eduCategory} />
        </div>

        <div className="bg-white rounded-2xl shadow px-4 py-6">
          <CategoryTabs selected={selectedCategory} onChange={setSelectedCategory} />
          <PostList category={selectedCategory} />
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="max-w-screen-md mx-auto flex justify-end">
          <FloatingWriteButton scrollY={window.scrollY} selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;