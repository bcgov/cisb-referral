import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiService } from "../services/api";
import type { User } from "../types";
import { UserRole } from "../types";

export function useCurrentUser() {
  const { data: currentUser, isLoading, error } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: () => apiService.fetchCurrentUser(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isSystemAdmin = currentUser?.role === UserRole.SYSTEM_ADMINISTRATOR;
  const isForbidden =
    axios.isAxiosError(error) && error.response?.status === 403;

  return { currentUser, isLoading, isSystemAdmin, isForbidden };
}
