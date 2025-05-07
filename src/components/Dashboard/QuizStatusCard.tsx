import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Dumbbell, ActivitySquare } from "lucide-react";

interface QuizResult {
  id: string;
  quiz_id: string;
  score: number;
  total: number;
  created_at: string;
}

const QuizStatusCard: React.FC = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);

  const quizNameMap: Record<string, { label: string; icon: React.ReactNode }> = {
    basic: {
      label: "기초해부학",
      icon: <Dumbbell size={20} className="text-white" />,
    },
    functional: {
      label: "기능해부학",
      icon: <ActivitySquare size={20} className="text-white" />,
    },
    neuro: {
      label: "신경해부학",
      icon: <BrainCircuit size={20} className="text-white" />,
    },
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("id, quiz_id, score, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) setLatestResult(data);
    })();
  }, [user]);

  const percentage =
    latestResult && latestResult.total > 0
      ? Math.round((latestResult.score / latestResult.total) * 100)
      : 0;

  const quizData =
    latestResult && quizNameMap[latestResult.quiz_id]
      ? quizNameMap[latestResult.quiz_id]
      : { label: latestResult?.quiz_id || "", icon: null };

  return (
    <div className="bg-white rounded-xl p-4 mb-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-base">나의 퀴즈 현황</h2>
        <div
          className="flex items-center text-sm text-blue-500 cursor-pointer"
          onClick={() => navigate("/mypage")}
        >
          <span className="font-medium">전체보기</span>
          <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </div>
      </div>

      {latestResult ? (
        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
          <div className="flex items-center">
            <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center mr-3">
              {quizData.icon}
            </div>
            <div>
              <p className="text-sm font-medium">{quizData.label} 퀴즈</p>
              <p className="text-xs text-gray-500 mt-0.5">
                총 {latestResult.total}문제 중 {latestResult.score}문제 완료
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-blue-500">
              {percentage}%
            </span>
            <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">아직 푼 퀴즈가 없습니다.</div>
      )}
    </div>
  );
};

export default QuizStatusCard;
