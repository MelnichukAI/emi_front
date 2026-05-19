import { getHomePathForSession, hydrateAuthSession } from "@/lib/auth-session";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    void hydrateAuthSession().then((restored) => {
      setTarget(getHomePathForSession(restored));
    });
  }, []);

  if (!target) {
    return null;
  }

  return <Redirect href={target} />;
}
