import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

interface Props {
  postId: string;
}

const LikeButtons: React.FC<Props> = ({ postId }) => {
  const user = useUser();
  const [currentReaction, setCurrentReaction] = useState<"like" | "dislike" | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const fetchState = async () => {
    const { data: post } = await supabase
      .from("posts")
      .select("likes, dislikes")
      .eq("id", postId)
      .single();

    if (post) {
      setLikeCount(post.likes);
      setDislikeCount(post.dislikes);
    }

    if (user) {
      const { data: reaction } = await supabase
        .from("post_reactions")
        .select("reaction_type")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      setCurrentReaction(reaction?.reaction_type ?? null);
    }
  };

  useEffect(() => {
    if (user) fetchState();
  }, [user]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (!user) return;

    if (currentReaction === type) {
      // ✅ 같은 반응을 다시 누르면 → 제거
      await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setCurrentReaction(null);
    } else if (currentReaction === null) {
      // ✅ 아무것도 없으면 → insert
      await supabase
        .from("post_reactions")
        .insert({ post_id: postId, user_id: user.id, reaction_type: type });
      setCurrentReaction(type);
    } else {
      // ✅ 다른 반응을 눌렀으면 → update
      await supabase
        .from("post_reactions")
        .update({ reaction_type: type })
        .eq("post_id", postId)
        .eq("user_id", user.id);
      setCurrentReaction(type);
    }

    fetchState(); // ✅ 최신 좋아요/싫어요 수 다시 불러오기
  };

  return (
    <div className="flex items-center gap-3">
      <button
        className={`px-2 py-1 rounded ${currentReaction === "like" ? "bg-red-500 text-white" : "bg-gray-200"}`}
        onClick={() => handleReaction("like")}
      >
        👍 {likeCount}
      </button>
      <button
        className={`px-2 py-1 rounded ${currentReaction === "dislike" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        onClick={() => handleReaction("dislike")}
      >
        👎 {dislikeCount}
      </button>
    </div>
  );
};

export default LikeButtons;
