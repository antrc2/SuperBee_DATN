// DonatePromotionDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@components/Admin/Layout/Layout.jsx";
import LoadingDomain from "@components/Loading/LoadingDomain";
import api from "@utils/http";
import { useNotification } from "@contexts/NotificationContext";
import DonatePromotionPage from "./DonatePromotionPage";
import { DONATE_PROMOTION_FILTERS_CONFIG } from "./filterConfigs";

const LOCAL_SEARCHABLE_KEYS = [
  "id",
  "amount",
  "creator.username",
  "creator.email",
  "creator.phone",
];

const DonatePromotionDashboard = () => {
  const { pop, conFim } = useNotification();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTermLocal, setSearchTermLocal] = useState("");
  const [paginationMeta, setPaginationMeta] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const currentFilters = {};
    DONATE_PROMOTION_FILTERS_CONFIG.forEach((config) => {
      if (config.type === "number_range") {
        if (params.has(config.minName))
          currentFilters[config.minName] = params.get(config.minName);
        if (params.has(config.maxName))
          currentFilters[config.maxName] = params.get(config.maxName);
      } else if (config.type === "date_range") {
        if (params.has(config.startName))
          currentFilters[config.startName] = params.get(config.startName);
        if (params.has(config.endName))
          currentFilters[config.endName] = params.get(config.endName);
      } else {
        if (params.has(config.name))
          currentFilters[config.name] = params.get(config.name);
      }
    });
    return currentFilters;
  }, [location.search]);

  const getPromotions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    try {
      const response = await api.get("/admin/donate_promotions", { params });
      const { data, ...meta } = response.data.data;
      setPromotions(data);
      setPaginationMeta(meta);

      // console.log(response.data.data.data);
      // console.log("hêh");

      pop("Lấy danh sách khuyến mãi thành công", "s");
    } catch (error) {
      pop("Lỗi khi tải khuyến mãi", "e");
      setPromotions([]);
      setPaginationMeta(null);

      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    getPromotions();
  }, [getPromotions]);

  const handleAdd = () => navigate("/admin/donatePromotions/new");

  const handleApplyFilters = (newFilters) => {
    const params = new URLSearchParams();
    for (const key in newFilters) {
      params.set(key, newFilters[key]);
    }
    params.set("page", "1");
    navigate({ search: params.toString() });
  };

  const handleResetFilters = () => {
    navigate({ search: "" });
  };

  const handleAction = async (actionType, id, confirmMessage) => {
    const ok = await conFim(confirmMessage);
    if (ok) {
      try {
        if (actionType === "undo") {
          await api.post(`/admin/donate_promotions/${id}/undo`);
        } else {
          await api.delete(`/admin/donate_promotions/${id}`);
        }
        getPromotions();
      } catch (err) {
        console.error("Lỗi khi thực hiện hành động:", err);
      }
    }
  };
  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate({ search: params.toString() });
    setSearchTermLocal(""); // Reset tìm kiếm FE khi chuyển trang
  };
  const displayedPromotions = useMemo(() => {
    if (!searchTermLocal) return promotions;
    const term = searchTermLocal.toLowerCase();
    return promotions.filter((item) => {
      return LOCAL_SEARCHABLE_KEYS.some((key) => {
        const keys = key.split(".");
        let value = item;
        for (let k of keys) value = value?.[k];
        return value?.toString().toLowerCase().includes(term);
      });
    });
  }, [promotions, searchTermLocal]);

  if (loading) return <LoadingDomain />;

  return (
    <Layout
      title="Danh sách khuyến mãi nạp thẻ"
      showBackButton={false}
      showAddButton={true}
      onAdd={handleAdd}
      
      onLocalSearch={setSearchTermLocal}
      initialSearchTermLocal={searchTermLocal}

      paginationMeta={paginationMeta}
      onPageChange={handlePageChange}

      onApplyFilters={handleApplyFilters}
      onResetFilters={handleResetFilters}
      initialFilters={filters}
      filterConfig={DONATE_PROMOTION_FILTERS_CONFIG}
      activeFilterCount={Object.keys(filters).length}
    >
      <DonatePromotionPage
        data={displayedPromotions}
        handleLock={(id) => handleAction("lock", id, "Tắt khuyến mãi này?")}
        handleUndo={(id) =>
          handleAction("undo", id, "Kích hoạt lại khuyến mãi này?")
        }
      />
    </Layout>
  );
};

export default DonatePromotionDashboard;
