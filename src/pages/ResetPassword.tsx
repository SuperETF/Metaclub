import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [step, setStep] = useState<"reset" | "complete">("reset");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | "">("");
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const navigate = useNavigate();

  // ✅ Supabase 세션 인증 처리
  useEffect(() => {
    const run = async () => {
      const url = window.location.href.includes("#")
        ? window.location.href.replace("#", "?")
        : window.location.href;

      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error || !data.session) {
        toast.error("링크가 유효하지 않거나 만료되었습니다.");
        navigate("/login", { replace: true });
      }
    };
    run();
  }, [navigate]);

  useEffect(() => {
    if (!password) return setPasswordStrength("");

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      setPasswordStrength("weak");
    } else if (hasLetter && hasNumber && hasSpecial && password.length >= 10) {
      setPasswordStrength("strong");
    } else if ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial)) {
      setPasswordStrength("medium");
    } else {
      setPasswordStrength("weak");
    }
  }, [password]);

  useEffect(() => {
    const newErrors = { password: "", confirmPassword: "" };

    if (password && password.length < 8) newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    if (confirmPassword && password !== confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";

    setErrors(newErrors);
  }, [password, confirmPassword]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const handleResetPassword = async () => {
    if (errors.password || errors.confirmPassword || !password || password !== confirmPassword) return;

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("비밀번호 변경 실패: " + error.message);
    } else {
      toast.success("비밀번호가 변경되었습니다.");
      setStep("complete");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="fixed top-0 w-full bg-white shadow-sm z-10 px-4 py-3 flex items-center">
        <h1 className="text-lg font-medium text-center w-full">
          {step === "reset" ? "비밀번호 재설정" : "비밀번호 재설정 완료"}
        </h1>
      </div>

      <div className="flex-1 pt-16 pb-24 px-5">
        {step === "reset" ? (
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="비밀번호 입력 (8자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}>
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

            {password && (
              <div className="mt-3 mb-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()}`}
                    style={{
                      width:
                        passwordStrength === "weak"
                          ? "33%"
                          : passwordStrength === "medium"
                            ? "66%"
                            : "100%",
                    }}
                  />
                </div>
              </div>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
            <div className="relative mb-4">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="비밀번호 재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            {!errors.confirmPassword && confirmPassword && (
              <p className="text-sm text-green-600">비밀번호가 일치합니다</p>
            )}

            <button
              className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-medium ${
                password.length >= 8 && password === confirmPassword
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={password.length < 8 || password !== confirmPassword}
              onClick={handleResetPassword}
            >
              비밀번호 재설정
            </button>
          </div>
        ) : (
          <div className="text-center mt-24">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
              <i className="fas fa-check text-3xl text-green-600"></i>
            </div>
            <h2 className="text-xl font-bold mb-2">비밀번호 재설정 완료</h2>
            <p className="text-gray-600 mb-8">새 비밀번호로 변경되었습니다</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
