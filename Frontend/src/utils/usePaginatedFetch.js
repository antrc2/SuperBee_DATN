// src/hooks/usePaginatedFetch.js
import { useState, useCallback } from "react";
import api from "@utils/http";

export function usePaginatedFetch(url, initialData = [], limit = 8) {
  console.log("🚀 ~ usePaginatedFetch ~ initialData:", initialData);
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(2); // Bắt đầu từ trang 2 vì trang 1 đã có initialData
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await api.get(`${url}&page=${page}&limit=${limit}`);
      const newItems = response.data.data;

      setData((prevData) => [...prevData, ...newItems]);
      setPage((prevPage) => prevPage + 1);
      setHasMore(response.data.next_page_url !== null);
    } catch (error) {
      console.error("Failed to fetch more data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, url, limit]);

  return { data, loading, hasMore, loadMore };
}
