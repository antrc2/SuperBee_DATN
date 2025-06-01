// project-root/src/utils/useApiKey.js
import { useState, useEffect } from "react";

export function useApiKey(enabled = true) {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    if (!enabled) return;
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data.json");
        return res.json();
      })
      .then((json) => setApiKey(json.API_KEY))
      .catch((err) => {
        console.error(err);
        setApiKey(null);
      });
  }, [enabled]);

  return apiKey;
}
