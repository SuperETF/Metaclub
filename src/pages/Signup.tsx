 //Signup.tsx 코드

 import React, { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "../lib/supabaseClient";
 import MobileLayout from "../layouts/MobileLayout";
 import InputField from "../components/common/InputField";
 import { toast } from "react-toastify";
 
 const Signup: React.FC = () => {
   const navigate = useNavigate();
 
   const [email, setEmail] = useState("");
   const [emailChecking, setEmailChecking] = useState(false);
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [name, setName] = useState("");
   const [nickname, setNickname] = useState("");
   const [phone, setPhone] = useState("");
   const [agreement, setAgreement] = useState(false);
   const [marketing, setMarketing] = useState(false);
   const [modalType, setModalType] = useState<"privacy" | "marketing" | null>(null);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [focusedField, setFocusedField] = useState<string | null>(null);
   const [isFormValid, setIsFormValid] = useState(false);
 
   const checkEmailExists = async (email: string) => {
     setEmailChecking(true);
     const { data } = await supabase.from("profiles").select("id").eq("email", email).single();
     setEmailChecking(false);
     return !!data;
   };
 
   useEffect(() => {
     const timer = setTimeout(async () => {
       if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
       const exists = await checkEmailExists(email);
       setErrors(prev => ({ ...prev, email: exists ? "이미 등록된 이메일입니다" : "" }));
     }, 500);
     return () => clearTimeout(timer);
   }, [email]);
 
   const validatePassword = (val: string) => val.length >= 8 ? "" : "비밀번호는 8자 이상이어야 합니다";
   const validateConfirmPassword = (val: string) => val === password ? "" : "비밀번호가 일치하지 않습니다";
   const validateName = (val: string) => val.trim() ? "" : "이름을 입력해주세요";
   const validateNickname = (val: string) => val.trim() ? "" : "닉네임을 입력해주세요";
   const validatePhone = (val: string) => /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/.test(val) ? "" : "유효한 휴대폰 번호를 입력해주세요";
 
   const handleInputChange = (field: string, value: string) => {
     switch (field) {
       case "email":
         setEmail(value);
         break;
       case "password":
         setPassword(value);
         setErrors({ ...errors, password: validatePassword(value) });
         break;
       case "confirmPassword":
         setConfirmPassword(value);
         setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
         break;
       case "name":
         setName(value);
         setErrors({ ...errors, name: validateName(value) });
         break;
       case "nickname":
         setNickname(value);
         setErrors({ ...errors, nickname: validateNickname(value) });
         break;
       case "phone": {
         const formatted = value
           .replace(/[^0-9]/g, "")
           .replace(
             /^([0-9]{0,3})([0-9]{0,4})([0-9]{0,4})$/,
             (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join("-")
           )
           .substring(0, 13);
         setPhone(formatted);
         setErrors({ ...errors, phone: validatePhone(formatted) });
         break;
       }
     }
   };
 
   useEffect(() => {
     const valid = Boolean(
       email && !errors.email &&
       password && !errors.password &&
       confirmPassword && !errors.confirmPassword &&
       name && !errors.name &&
       nickname && !errors.nickname &&
       phone && !errors.phone &&
       agreement && !emailChecking
     );
     setIsFormValid(valid);
   }, [email, password, confirmPassword, name, nickname, phone, agreement, errors, emailChecking]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!isFormValid) return;
 
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: `${window.location.origin}/verify-email`, // 🔥 이게 맞아
         data: { nickname, name, phone, marketing, agreement },
       },
     });
   
     if (error) {
       toast.error(
         error.message.includes("User already registered")
           ? "이미 등록된 이메일입니다"
           : "회원가입 실패: " + error.message
       );
       return;
     }
 
     toast.success("회원가입 완료! 이메일을 확인해주세요.");
     navigate("/login");
   };
 
   return (
     <MobileLayout>
       <form onSubmit={handleSubmit} className="space-y-5 w-full">
         <InputField label="이메일" field="email" value={email} error={errors.email} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
         <InputField label="비밀번호" field="password" type="password" value={password} error={errors.password} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
         <InputField label="비밀번호 확인" field="confirmPassword" type="password" value={confirmPassword} error={errors.confirmPassword} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
         <InputField label="이름" field="name" value={name} error={errors.name} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
         <InputField label="닉네임" field="nickname" value={nickname} error={errors.nickname} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
         <InputField label="휴대폰 번호" field="phone" value={phone} error={errors.phone} onChange={handleInputChange} focusedField={focusedField} setFocusedField={setFocusedField} />
 
         <div className="flex items-center gap-2">
           <input type="checkbox" checked={agreement} onChange={() => setAgreement(!agreement)} />
           <span className="text-sm">
             개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
             <button type="button" onClick={() => setModalType("privacy")} className="ml-1 text-xs underline text-blue-600">보기</button>
           </span>
         </div>
 
         <div className="flex items-center gap-2">
           <input type="checkbox" checked={marketing} onChange={() => setMarketing(!marketing)} />
           <span className="text-sm">
             마케팅 정보 수신 동의
             <button type="button" onClick={() => setModalType("marketing")} className="ml-1 text-xs underline text-blue-600">보기</button>
           </span>
         </div>
 
         <button type="submit" disabled={!isFormValid} className={`mt-4 w-full py-3.5 text-white font-medium rounded-lg transition-colors ${isFormValid ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}`}>
           가입하기
         </button>
       </form>
 
       {modalType && (
         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
             <h2 className="text-lg font-semibold mb-2">
               {modalType === "privacy" ? "개인정보 수집 및 이용 동의" : "마케팅 정보 수신 동의"}
             </h2>
             <div className="text-sm text-gray-700 space-y-2 max-h-64 overflow-y-auto">
               {modalType === "privacy" ? (
                 <>
                   <p>1. 수집 항목: 이메일, 비밀번호, 이름, 닉네임, 휴대폰 번호</p>
                   <p>2. 수집 목적: 회원 관리, 서비스 제공</p>
                   <p>3. 보유 기간: 회원 탈퇴 시까지</p>
                   <p>4. 동의를 거부할 권리가 있으며, 거부 시 회원가입이 제한됩니다.</p>
                 </>
               ) : (
                 <>
                   <p>1. 수집 항목: 이메일, 휴대폰 번호</p>
                   <p>2. 수집 목적: 이벤트, 광고성 정보 안내</p>
                   <p>3. 수신 방법: 이메일, 문자 등</p>
                   <p>4. 동의를 거부해도 서비스 이용에 제한은 없습니다.</p>
                 </>
               )}
             </div>
             <div className="text-right mt-4">
               <button onClick={() => setModalType(null)} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">닫기</button>
             </div>
           </div>
         </div>
       )}
     </MobileLayout>
   );
 };
 
 export default Signup;