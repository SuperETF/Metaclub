// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import QuizStatusCard from "../components/Dashboard/QuizStatusCard";
import QuizRanking from "../components/Dashboard/QuizRanking";
import LoanBanner from "../components/Dashboard/LoanBanner";
import HotPosts from "../components/Dashboard/HotPosts";
import EducationBoard from "../components/Dashboard/EducationBoard";
import EducationTabs from "../components/Dashboard/EducationTabs";
import CategoryTabs from "../components/Dashboard/CategoryTabs";
import PostList from "../components/Dashboard/PostList";
import SubjectButtons from "../components/Dashboard/SubjectButtons";
import FloatingWriteButton from "../components/Dashboard/FloatingWriteButton";
import { useTrackHomepage } from "../hooks/useTrackHomepage"; // ✅ 방문 기록 hook 추가

const Dashboard: React.FC = () => {
  useTrackHomepage(); // ✅ 방문 기록 실행

  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eduCategory, setEduCategory] = useState("all");
  const [scrollY, setScrollY] = useState(window.scrollY);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const state = location.state as { category?: string; scrollY?: number } | null;
    if (state?.category) setSelectedCategory(state.category);
    if (typeof state?.scrollY === "number") {
      requestAnimationFrame(() => {
        window.scrollTo({ top: state.scrollY, behavior: "instant" as ScrollBehavior });
      });
    }
  }, [location.state]);

  return (
    <div className="relative min-h-screen bg-[#f9fafb]">
      <main className="pt-28 pb-20">
        <div className="w-full px-2 sm:px-4 md:px-8 space-y-8">
          <SubjectButtons />
          <QuizStatusCard />
          <QuizRanking />
          <LoanBanner />
          <HotPosts />

          <section className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-bold text-gray-900">📚 교육 및 강의 정보</h2>
            </div>
            <EducationTabs selected={eduCategory} onChange={setEduCategory} />
            <EducationBoard category={eduCategory} />
          </section>
        </div>

        <div className="w-full bg-gray-50">
          <section className="space-y-4">
            <CategoryTabs selected={selectedCategory} onChange={setSelectedCategory} />
            <PostList category={selectedCategory} />
          </section>
        </div>
      </main>

      <div className="fixed bottom-6 left-0 right-0 z-50 px-4">
        <div className="w-full px-4 md:px-8 flex justify-end">
          <FloatingWriteButton scrollY={scrollY} selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
