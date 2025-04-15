// MyPostsPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  views: number;
}

const MyPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, content, created_at, likes, dislikes, views")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data as Post[]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const loadMorePosts = async () => {
    setLoading(true);
    await fetchPosts();
    setLoading(false);
  };

  const handleEdit = (postId: string) => {
    navigate(`/write/${postId}`);
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  return (
    <div className="relative bg-gray-50 min-h-screen pb-20">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-gray-700">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-medium text-gray-800">내가 쓴 게시물</h1>
          <button className="text-gray-700">
            <i className="fas fa-sliders-h text-lg"></i>
          </button>
        </div>
      </header>

      <main className="pt-16 px-4">
        {refreshing && (
          <div className="flex justify-center py-3 text-sm text-gray-500">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            새로고침 중...
          </div>
        )}

        {posts.length > 0 ? (
          <div className="space-y-4 pb-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <h2 className="text-lg font-medium text-gray-800 mb-1">{post.title}</h2>
                  <p className="text-xs text-gray-500 mb-2">{new Date(post.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <i className="fas fa-heart text-red-500 mr-1"></i>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <i className="fas fa-thumbs-down text-gray-400 mr-1"></i>
                      <span>{post.dislikes}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-eye text-gray-400 mr-1"></i>
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>

                <div className="flex text-sm border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(post.id)}
                    className="flex-1 py-2 text-blue-500 font-medium border-r border-gray-100"
                  >
                    <i className="fas fa-edit mr-1"></i> 수정
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex-1 py-2 text-red-500 font-medium"
                  >
                    <i className="fas fa-trash-alt mr-1"></i> 삭제
                  </button>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <button
                onClick={loadMorePosts}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-blue-600"
              >
                더 보기
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-file-alt text-5xl"></i>
            </div>
            <p className="text-gray-500 mb-4">아직 작성한 게시물이 없습니다</p>
            <button
              onClick={() => navigate("/write")}
              className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-sm hover:bg-blue-600"
            >
              <i className="fas fa-plus mr-1"></i> 첫 게시물 작성하기
            </button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="grid grid-cols-5 h-14">
          <button className="flex flex-col items-center justify-center">
            <i className="fas fa-home text-gray-400"></i>
            <span className="text-xs mt-1 text-gray-400">홈</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <i className="fas fa-search text-gray-400"></i>
            <span className="text-xs mt-1 text-gray-400">검색</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <i className="fas fa-plus-circle text-blue-500 text-2xl"></i>
            <span className="text-xs mt-1 text-blue-500">작성</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <i className="fas fa-bell text-gray-400"></i>
            <span className="text-xs mt-1 text-gray-400">알림</span>
          </button>
          <button className="flex flex-col items-center justify-center">
            <i className="fas fa-file-alt text-blue-500"></i>
            <span className="text-xs mt-1 text-blue-500">게시물</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MyPostsPage;