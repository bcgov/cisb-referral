import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services";
import type { User } from "../types";

/**
 * Hook to fetch and cache the currently authenticated user's profile.
 * Returns the full User object including role, cached for the session.
 */
export function useCurrentUser() {
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: () => apiService.fetchCurrentUser(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { currentUser, isLoading };
}
