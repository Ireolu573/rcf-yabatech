import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  address: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  youtube: string;
};

const empty: SiteSettings = {
  address: "",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  youtube: "",
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
          setSettings({ ...empty, ...map } as SiteSettings);
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
};
