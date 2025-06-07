// src/hooks/useTrackHomepage.ts
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export const useTrackHomepage = () => {
  useEffect(() => {
    const track = async () => {
      const userAgent = navigator.userAgent;
      const ip = await fetch("https://api.ipify.org?format=json")
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => "unknown");

      const user = await supabase.auth.getUser();

      await supabase.from("page_views").insert({
        path: "/dashboard",
        user_agent: userAgent,
        ip_address: ip,
        user_id: user.data.user?.id ?? null,
      });
    };

    track();
  }, []);
};
