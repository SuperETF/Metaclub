// src/pages/ResendEmail.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const ResendEmail: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setMessage("실패: " + error.message);
    } else {
      setMessage("📮 인증 메일을 다시 보냈습니다. 메일함을 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full space-y-4">
        <h2 className="text-lg font-semibold">이메일 인증 재전송</h2>
        <input
          type="email"
          className="w-full px-4 py-2 border rounded-md"
          placeholder="가입한 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleResend} className="btn-primary w-full">
          인증 이메일 다시 보내기
        </button>
        {message && <p className="text-sm text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default ResendEmail;
