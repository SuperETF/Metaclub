import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
    .from("dashboard_daily_traffic")
    .select("*")
    .order("date", { ascending: false })
    .limit(7);

  if (error || !data) {
    return new Response(JSON.stringify({
      response_type: "ephemeral",
      text: "❌ 홈 트래픽 데이터를 불러올 수 없습니다.",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const report = data.map(
    (row) => `• ${row.date.slice(5)} - ${row.total_visits}명`
  ).join("\n");

  return new Response(JSON.stringify({
    response_type: "in_channel",
    text: `📈 대시보드 방문 통계 (최근 7일)\n\n${report}`,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
