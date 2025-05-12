import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

interface RankingItem {
  userId: string;
  nickname: string;
  profileImg: string;
  score: number;
  grade?: string;
}

const quizCategories = [
  { id: "basic", name: "기초해부학" },
  { id: "functional", name: "기능해부학" },
  { id: "neuro", name: "신경해부학" },
];

const QuizRanking: React.FC = () => {
  const user = useUser();
  const myId = user?.id;
  const [category, setCategory] = useState(quizCategories[0].id);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRankingData = async () => {
      const { data: quizData, error } = await supabase
        .from("quiz_rankings")
        .select("user_id, score, grade")
        .eq("quiz_id", category)
        .order("score", { ascending: false })
        .limit(10);

      if (error || !quizData) {
        console.error("퀴즈 랭킹 조회 실패:", error?.message);
        return;
      }

      const userIds = [...new Set(quizData.map((r) => r.user_id).filter(Boolean))];

      // ✅ public_profile_nicknames 뷰 사용
      const { data: profiles } = await supabase
        .from("public_profile_nicknames")
        .select("id, nickname, profile_img")
        .in("id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [
          p.id,
          {
            nickname: p.nickname ?? "Unknown",
            profileImg: p.profile_img ?? "/default-profile.png",
          },
        ])
      );

      const combined: RankingItem[] = quizData.map((row) => ({
        userId: row.user_id,
        score: row.score,
        grade: row.grade,
        nickname: profileMap.get(row.user_id)?.nickname ?? "Unknown",
        profileImg: profileMap.get(row.user_id)?.profileImg ?? "/default-profile.png",
      }));

      // 내 랭킹이 없으면 별도 추가
      if (myId && !combined.find((r) => r.userId === myId)) {
        const { data: myResult } = await supabase
          .from("quiz_rankings")
          .select("score, grade")
          .eq("quiz_id", category)
          .eq("user_id", myId)
          .maybeSingle();

        const { data: myProfile } = await supabase
          .from("public_profile_nicknames")
          .select("nickname, profile_img")
          .eq("id", myId)
          .maybeSingle();

        if (myResult && myProfile) {
          combined.push({
            userId: myId,
            score: myResult.score,
            grade: myResult.grade,
            nickname: myProfile.nickname ?? "Me",
            profileImg: myProfile.profile_img ?? "/default-profile.png",
          });
        }
      }

      setRankings(combined);
    };

    fetchRankingData();
  }, [category, myId]);

  const scrollToMyRanking = () => {
    if (!myId || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLDivElement>(`#ranking-${myId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const renderMedal = (rank: number) => {
    if (rank === 1) return <i className="fas fa-medal text-yellow-500 text-xl" />;
    if (rank === 2) return <i className="fas fa-medal text-gray-400 text-xl" />;
    if (rank === 3) return <i className="fas fa-medal text-yellow-700 text-xl" />;
    return <span className="text-lg font-bold text-gray-500">{rank}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-base font-semibold text-gray-900">🏆 퀴즈 랭킹</h2>
        <div className="flex gap-2">
          {quizCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                category === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <button
          onClick={scrollToMyRanking}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          내 랭킹 보기
        </button>
      </div>

      <div ref={listRef} className="space-y-2 max-h-[400px] overflow-y-auto">
        {rankings.map((u, idx) => {
          const rank = idx + 1;
          const isMine = u.userId === myId;
          const key = `${u.userId}-${rank}`;

          return (
            <div
              key={key}
              id={`ranking-${u.userId}`}
              className={`flex items-center p-3 rounded-lg shadow-sm ${
                isMine ? "border-2 border-blue-500 bg-blue-50" : "bg-white"
              }`}
            >
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                {renderMedal(rank)}
              </div>
              <img
                src={u.profileImg}
                alt={`${u.nickname} 프로필`}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-profile.png";
                }}
              />
              <div className="flex-1">
                <p className="font-bold text-gray-800 truncate">{u.nickname}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-700">{u.score.toLocaleString()} 점</p>
                {u.grade && <span className="text-sm text-blue-600">{u.grade}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizRanking;
