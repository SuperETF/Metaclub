import React, { useEffect, useState } from "react";


interface BannerItem {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  bgColorClass: string;
}

const banners: BannerItem[] = [
  {
    title: "메-클에 오신 것을 환영합니다 🎉",
    description: "10% 더 높은 경쟁력을 갖추기 위한\n자료 공유 커뮤니티입니다.",
    imageUrl: "/images/B1.png",
    linkUrl: "https://metaclass.club/dashboard",
    bgColorClass: "from-indigo-50 to-indigo-100",
  },
  {
    title: "누군가에겐 큰 인사이트가 됩니다.🍀",
    description: "평범해 보여도,\n누군가에겐 큰 배움의 기회가 될 수 있어요 😌",
    imageUrl: "/images/B2.png",
    linkUrl: "https://metaclass.club/dashboard",
    bgColorClass: "from-indigo-50 to-indigo-100",
  },
  {
    title: "지금 기초해부학에 도전해보세요 👍",
    description: "당신의 기초 지식 능력은\n몇 점일까요?",
    imageUrl: "/images/B3.png",
    linkUrl: "https://metaclass.club/dashboard",
    bgColorClass: "from-indigo-50 to-indigo-100",
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
    }, 4000); // 배너 전환 간격

    return () => clearInterval(timer);
  }, []);

  const current = banners[index];

  return (
    <div className="overflow-hidden">
      {/* 🔄 배너 콘텐츠 */}
      <a
        href={current.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl p-4 mb-3 flex flex-row items-center justify-between gap-4
          bg-gradient-to-r ${current.bgColorClass}
          transition-all duration-500 ease-in-out transform
          ${fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}
      >
        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-800 text-base sm:text-lg leading-snug">
            {current.title}
          </h3>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed whitespace-pre-line">
            {current.description}
          </p>
        </div>

        {/* 이미지 */}
        <img
          src={current.imageUrl}
          alt="배너 이미지"
          className="w-20 h-20 object-contain flex-shrink-0"
        />
      </a>

      {/* 📣 광고 CTA */}
      <a
        href="https://tally.so/r/mJg0B7"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white bg-opacity-60 backdrop-blur-md border border-blue-200 rounded-lg p-3 text-center shadow-sm text-sm text-blue-800 hover:bg-opacity-80 transition"
      >
        👀 알리고 싶은 게 있나요?{" "}
        <span className="text-blue-600 font-semibold underline hover:text-blue-800">
          광고 문의
        </span>
      </a>
    </div>
  );
};

export default LoanBanner;
