import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import type { User } from "../types";
import { UserRole } from "../types";

export function useCurrentUser() {
  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: () => apiService.fetchCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });

  const isSystemAdmin = currentUser?.role === UserRole.SYSTEM_ADMINISTRATOR;

  return { currentUser, isLoading, isSystemAdmin };
}
