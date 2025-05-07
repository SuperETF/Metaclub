import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  const [scrollY, setScrollY] = useState(window.scrollY);

  // ✅ 실시간 scrollY 추적
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ location.state에서 category & scrollY 안전하게 처리
  useEffect(() => {
    const state = location.state as { category?: string; scrollY?: number } | null;

    if (state?.category) {
      setSelectedCategory(state.category);
    }

    if (typeof state?.scrollY === "number") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: state.scrollY, behavior: "instant" as ScrollBehavior });
      });
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen bg-gray-50">
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
          <FloatingWriteButton scrollY={scrollY} selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
