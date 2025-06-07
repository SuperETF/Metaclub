import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// 🔹 그룹핑 함수
function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce((acc: Record<string, T[]>, item) => {
    const groupKey = String(item[key]);
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
  .from("ad_click_effectiveness_by_ad")  // ✅ 반드시 이 View로
  .select("*")
    .order("date", { ascending: false })
    .limit(50); // ✅ 날짜별 광고 여러 개일 수 있으니 넉넉히 가져옴

  if (error || !data) {
    console.error("쿼리 실패:", error);
    return new Response(JSON.stringify({
      response_type: "ephemeral",
      text: "❌ 광고 효과 데이터를 불러올 수 없습니다.",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const grouped = groupBy(data, "date");

  let message = "📊 광고별 효과 요약 (최근 7일)\n\n";

  for (const [date, rows] of Object.entries(grouped)) {
    const visits = rows[0].total_visits;
    message += `[${date}] 방문자 ${visits}명\n`;

    message += rows
      .map(r => `• "${r.title}" → ${r.clicks} 클릭 (${r.ctr_percent}%)`)
      .join("\n");

    message += "\n\n";
  }

  return new Response(JSON.stringify({
    response_type: "in_channel",
    text: message.trim(),
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
