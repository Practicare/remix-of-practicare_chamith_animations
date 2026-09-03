import { useEffect, useMemo, useState } from "react";

export function usePagination<T>(items: T[], pageSize = 15) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset page when items shrink below the current page
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const paginated = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return {
    page,
    setPage,
    totalPages,
    pageSize,
    total: items.length,
    paginated,
  };
}
