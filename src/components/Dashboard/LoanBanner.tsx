import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface BannerItem {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  bgColorClass: string;
}

const LoanBanner: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("title, description, image_url, link_url, bg_color_class")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ 광고 데이터 불러오기 실패:", error);
        return;
      }

      if (data) {
        const mapped = data.map((ad) => ({
          title: ad.title,
          description: ad.description,
          imageUrl: ad.image_url,
          linkUrl: ad.link_url,
          bgColorClass: ad.bg_color_class,
        }));

        setBanners(mapped);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % banners.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(timer);
  }, [banners]);

  const current = banners[index];
  if (!current) return null;

  // 🔍 디버깅용 로그
  console.log("🔥 현재 배너 이미지 URL:", current.imageUrl);

  return (
    <div className="overflow-hidden">
      <a
  href={current.linkUrl}
  target="_blank"
  rel="noopener noreferrer"
  className={`block rounded-xl p-4 mb-3 flex items-center justify-between gap-4
    bg-blue-50
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
    console.warn("❌ 이미지 로딩 실패:", current.imageUrl);
    e.currentTarget.src = "/fallback-banner.png";
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
