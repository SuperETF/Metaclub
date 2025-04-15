// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";
import { getFriendlyError } from "../utils/getFriendlyError";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(getFriendlyError(error));
      return;
    }

    if (!data.user.email_confirmed_at) {
      toast.warning("❗ 이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.");
      await supabase.auth.signOut();
      return;
    }

    toast.success("로그인 성공!");
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-sm text-gray-400">유리한 클래스</h2>
          <h1 className="text-2xl font-extrabold text-indigo-600">메타 인지 클럽</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="이메일 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition"
          >
            로그인
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <button onClick={() => navigate("/find")}>아이디/비밀번호 찾기</button>
          <button onClick={() => navigate("/signup")}>회원가입</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
