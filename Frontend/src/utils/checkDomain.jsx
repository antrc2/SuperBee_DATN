import React, { useState, useEffect, useMemo } from "react";
import api from "./http";
import LoadingDomain from "../components/Loading/LoadingDomain";
import { ActiveDomain, NotFound } from "../pages";

export default function CheckDomain({
  url = "/domain",
  method = "GET",
  options = {}
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stableOptions = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setData(null);

    const fetchData = async () => {
      try {
        const res = await api.request({
          url,
          method,
          signal: controller.signal,
          ...options
        });
        if (res.status >= 200 && res.status < 300) {
          setData(res.data);
          setLoading(false);
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [url, method, stableOptions, options]);

  if (loading) return <LoadingDomain />;

  if (error) {
    const code = error?.response?.data?.code;
    if (code === "NO_ACTIVE") {
      return <ActiveDomain />;
    } else if (code === "NO_API_KEY") {
      return <NotFound />;
    }
    return <div>Error: {error.message}</div>;
  }

  // Trường hợp có data nhưng không lỗi
  return (
    <div>
      <h2>Domain Data</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
