import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard";

/**
 * Custom React Query hook for fetching dashboard statistics.
 * @returns {Object} React Query query result object.
 */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}
