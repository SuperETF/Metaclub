import React, { useEffect, useState } from "react";

interface BannerItem {
  title: string;
  description: string;
  imageUrl: string;
}

const banners: BannerItem[] = [
  {
    title: "메타인지클럽에 오신 것을 환영합니다🎉",
    description: "10% 더 높은 경쟁력을 갖추기 위한 자료 공유 커뮤니티입니다.",
    imageUrl:
      "/Public/images/B1.png", // 이미지 Base64 생략
  },
  {
    title: "💬 당신의 한 줄이 누군가에겐 큰 인사이트가 됩니다.",
    description: "평범해 보일지 몰라도, 누군가에게는 큰 배움의 기회가 될 수 있어요😌",
    imageUrl:
      "/Public/images/B2.png", // 이미지 Base64 생략
  },
  {
    title: "지금 바로 기초해부학에 도전해보세요👍",
    description: "당신의 기초 지식 능력은 몇점일까요!",
    imageUrl:
      "/Public/images/B3.png", // 이미지 Base64 생략
  },
];

const LoanBanner: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % banners.length);
        setFade(true);
      }, 300); // fade-out 시간
    }, 4000); // 배너 간격

    return () => clearInterval(timer);
  }, []);

  const current = banners[index];

  return (
    <div className="overflow-hidden">
      <div
        className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-2 flex items-center justify-between transition-all duration-500 ease-in-out transform ${
          fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <div>
          <h3 className="font-medium text-blue-800 text-lg">{current.title}</h3>
          <p className="text-sm text-blue-600 mt-1">{current.description}</p>
        </div>
        <img
          src={current.imageUrl}
          alt="배너 이미지"
          className="h-14 w-14 object-contain"
        />
      </div>

      {/* ✅ 광고 신청 박스 */}
      <div className="bg-white bg-opacity-60 backdrop-blur-md border border-blue-200 rounded-lg p-3 text-center shadow-sm text-sm text-blue-800">
        👀 알리고 싶은 게 있나요?{" "}
        <a
          href="https://tally.so/r/mJg0B7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-semibold underline hover:text-blue-800"
        >
          광고 문의
        </a>
      </div>
    </div>
  );
};

export default LoanBanner;
