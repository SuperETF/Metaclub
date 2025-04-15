// src/utils/getFriendlyError.ts
export const getFriendlyError = (error: any): string => {
    const msg = error?.message?.toLowerCase?.() || "";
  
    if (msg.includes("email not confirmed")) return "이메일 인증을 완료해주세요.";
    if (msg.includes("invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
    if (msg.includes("user already registered")) return "이미 가입된 이메일입니다.";
    if (msg.includes("email address is invalid")) return "유효한 이메일 주소를 입력해주세요.";
    if (msg.includes("valid password")) return "유효한 비밀번호를 입력해주세요.";
    if (msg.includes("valid email")) return "유효한 이메일을 입력해주세요.";
    if (msg.includes("email link is invalid")) return "이메일 인증 링크가 잘못되었거나 만료되었습니다.";
    if (msg.includes("cannot find user")) return "사용자를 찾을 수 없습니다.";
  
    return "알 수 없는 오류가 발생했습니다.";
  };
  