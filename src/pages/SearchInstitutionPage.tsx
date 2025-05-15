import React, { useState, useEffect } from "react";
import PageLayout from "../layouts/PageLayout";
import { supabase } from "../lib/supabaseClient";

interface Institution {
  id: string;
  name: string;
  description: string;
  location: string;
  url: string;
  category: string;
  image_url: string;
}

const SearchInstitutionPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const filters = [
    "전체",
    "웨이트 및 보디빌딩",
    "필라테스",
    "체형 교정",
    "통증 운동",
    "물리치료사",
    "척추측만증",
    "재활운동", // ✅ 추가됨
    "국가 기관",
  ];

  useEffect(() => {
    const fetchInstitutions = async () => {
      let query = supabase
        .from("education_institutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (selectedFilter !== "전체") {
        query = query.ilike("category", `%${selectedFilter}%`);
      }

      if (search.trim()) {
        query = query.or(
          `name.ilike.%${search}%,location.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (!error && data) {
        setInstitutions(data);
      } else {
        setInstitutions([]);
      }
    };

    fetchInstitutions();
  }, [search, selectedFilter]);

  return (
    <PageLayout>
      <div className="w-full max-w-screen-md mx-auto px-4 pb-10 bg-gray-50 min-h-screen">
        <h1 className="text-xl font-bold mt-4 mb-3">교육기관 검색</h1>

        {/* 검색창 */}
        <div className="relative mb-4 bg-white rounded-lg shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="교육기관 이름 또는 지역 검색"
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {/* 필터 버튼 */}
        <div className="-mx-4 px-4 mb-5 overflow-x-auto custom-scrollbar">
          <div className="inline-flex space-x-2 py-2 bg-white rounded-lg shadow-sm px-4">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  selectedFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 검색 결과 없음 */}
        {institutions.length === 0 && (
          <p className="text-center text-gray-400 mt-8">검색 결과가 없습니다.</p>
        )}

        {/* 카드 리스트 */}
        {institutions.map((institution) => (
          <a
            key={institution.id}
            href={institution.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-row items-center gap-4 cursor-pointer"
          >
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={institution.image_url}
                alt={institution.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base text-gray-900 truncate">
                {institution.name}
              </h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {institution.description}
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <i className="fas fa-map-marker-alt mr-1" />
                {institution.location}
              </div>
            </div>

            <i className="fas fa-chevron-right text-gray-400 ml-2" />
          </a>
        ))}

        {/* 하단 안내 문구 */}
        <p className="text-xs text-gray-400 text-center mt-10 px-4 leading-relaxed max-w-md mx-auto">
          모든 로고 및 이미지는 각 기관의 공식 사이트 또는 오픈된 정보를 바탕으로 구성되었으며, 문제가 있을 경우
          <a
            href="https://tally.so/r/wMgxJE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500 mx-1"
          >
            신고 및 요청 폼
          </a>
          을 통해 알려주시면 정중히 검토 후 신속히 조치하겠습니다.
        </p>
      </div>
    </PageLayout>
  );
};

export default SearchInstitutionPage;
