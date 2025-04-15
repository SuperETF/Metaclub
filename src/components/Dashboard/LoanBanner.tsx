import React, { useEffect, useState } from "react";

interface BannerItem {
  title: string;
  description: string;
  imageUrl: string;
}

const banners: BannerItem[] = [
  {
    title: "파브스포츠는 최강이다.",
    description: "자랑스러운 우리는 파브스포츠",
    imageUrl:
      "https://readdy.ai/api/search-image?query=3D%20minimalist%20illustration%20of%20a%20blue%20piggy%20bank%20with%20coins&width=80&height=80",
  },
  {
    title: "운동은 했니?",
    description: "기초해부학 풀고 나서 해도 늦지 않아",
    imageUrl:
      "https://readdy.ai/api/search-image?query=dumbbell%20icon%20in%203D&width=80&height=80",
  },
  {
    title: "뉴로 부스트",
    description: "지금 바로 신경해부학 도전해보세요!",
    imageUrl:
      "https://readdy.ai/api/search-image?query=brain%203D%20illustration&width=80&height=80",
  },
];

const LoanBanner: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false); // 사라지기
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % banners.length);
        setFade(true); // 새 배너 등장
      }, 300); // fade-out 타이밍
    }, 4000); // 4초 간격

    return () => clearInterval(timer);
  }, []);

  const current = banners[index];

  return (
    <div className="overflow-hidden">
      <div
        className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-5 flex items-center justify-between transition-all duration-500 ease-in-out transform ${
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
    </div>
  );
};

export default LoanBanner;
