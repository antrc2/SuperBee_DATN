function useUrlUtils() {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Navigate to a new URL
   * @param {string} url - target URL/path
   * @param {{ replace?: boolean, state?: any }} options
   */
  const navigateTo = (url, options = {}) => {
    const { replace = false, state } = options;
    navigate(url, { replace, state });
  };

  /**
   * Get current URL information
   */
  const getCurrentUrlInfo = () => ({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    fullUrl: `${location.pathname}${location.search}${location.hash}`
  });

  /**
   * Parse and return query parameters as an object
   */
  const getQueryParams = () => queryString.parse(location.search);

  /**
   * Add or update query parameters
   * @param {Record<string, any>} newParams
   * @param {{ replace?: boolean, state?: any }} options
   */
  const updateQueryParams = (newParams, options = {}) => {
    const currentParams = queryString.parse(location.search);
    const updated = { ...currentParams, ...newParams };
    const newSearch = queryString.stringify(updated);
    const path = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    navigate(path, options);
  };

  /**
   * Remove a specific query parameter
   * @param {string} paramName
   * @param {{ replace?: boolean, state?: any }} options
   */
  const removeQueryParam = (paramName, options = {}) => {
    const currentParams = queryString.parse(location.search);
    delete currentParams[paramName];
    const newSearch = queryString.stringify(currentParams);
    const path = `${location.pathname}${newSearch ? `?${newSearch}` : ""}`;
    navigate(path, options);
  };

  return {
    navigateTo,
    getCurrentUrlInfo,
    getQueryParams,
    updateQueryParams,
    removeQueryParam
  };
}