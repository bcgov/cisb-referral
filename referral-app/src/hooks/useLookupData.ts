import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services";

export function useLookupData() {
  const regions = useQuery({
    queryKey: ["regions"],
    queryFn: () => apiService.fetchRegions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const ministries = useQuery({
    queryKey: ["ministries"],
    queryFn: () => apiService.fetchMinistries(),
    staleTime: 5 * 60 * 1000,
  });

  const agencyTypes = useQuery({
    queryKey: ["agency-types"],
    queryFn: () => apiService.fetchAgencyTypes(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    regions: regions.data ?? [],
    ministries: ministries.data ?? [],
    agencyTypes: agencyTypes.data ?? [],
    isLoading:
      regions.isLoading || ministries.isLoading || agencyTypes.isLoading,
    error: regions.error || ministries.error || agencyTypes.error,
  };
}
