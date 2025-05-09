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
    imageUrl: "https://mivnacfecycugbbdwixv.supabase.co/storage/v1/object/sign/benner/B1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYmRjZDUyOC01OTUwLTQ3YzQtYmQ5ZC05MDQ5ODI3Y2U3ZDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZW5uZXIvQjEucG5nIiwiaWF0IjoxNzQ2Njk5ODA4LCJleHAiOjE3NDkyOTE4MDh9.OKVGsMqsR13BjU6Z8xavOz7xTEUaOY-HyF2Ii7Y9VcY",      // ← 앞에 슬래시 필수
    linkUrl: "https://metaclass.club/dashboard",
    bgColorClass: "from-indigo-50 to-indigo-100",
  },
  {
    title: "누군가에겐 큰 인사이트가 됩니다🍀",
    description: "평범해 보여도 누군가에겐\n큰 배움의 기회가 될 수 있어요 😌",
    imageUrl: "https://mivnacfecycugbbdwixv.supabase.co/storage/v1/object/sign/benner/B2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYmRjZDUyOC01OTUwLTQ3YzQtYmQ5ZC05MDQ5ODI3Y2U3ZDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZW5uZXIvQjIucG5nIiwiaWF0IjoxNzQ2NzAwNTgzLCJleHAiOjE3NDkyOTI1ODN9.6Sv6sZ_HGSXEv7ie3ReBKmWjHVqNiyUfpTndWbwpmlc",      // ← 앞에 슬래시 필수
    linkUrl: "https://metaclass.club/dashboard",
    bgColorClass: "from-indigo-50 to-indigo-100",
  },
  {
    title: "지금 기초해부학에 도전해보세요 👍",
    description: "당신의 기초 지식 능력은 몇 점일까요?",
    imageUrl: "https://mivnacfecycugbbdwixv.supabase.co/storage/v1/object/sign/benner/B3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zYmRjZDUyOC01OTUwLTQ3YzQtYmQ5ZC05MDQ5ODI3Y2U3ZDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZW5uZXIvQjMucG5nIiwiaWF0IjoxNzQ2NzAwNTkyLCJleHAiOjE3NDkyOTI1OTJ9.yMrmeRtZs0NLOs0d0Aou7390ow1vANL1E2v3nJLmD6w",      // ← 앞에 슬래시 필수
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
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const current = banners[index];

  return (
    <div className="overflow-hidden">
      <a
        href={current.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block rounded-xl p-4 mb-3 flex items-center justify-between gap-4
          bg-gradient-to-r ${current.bgColorClass}
          transition-all duration-500 ease-in-out transform
          ${fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-800 text-base sm:text-lg leading-snug">
            {current.title}
          </h3>
          <p className="text-sm text-blue-700 mt-1 leading-relaxed whitespace-pre-line">
            {current.description}
          </p>
        </div>

        <img
          src={current.imageUrl}
          alt="배너 이미지"
          className="w-20 h-20 object-contain flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </a>

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
