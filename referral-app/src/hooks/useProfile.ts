import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "../services";

export const PROFILE_QUERY_KEY = ["profile"] as const;

export const useProfile = () => {
  const query = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => apiService.getProfile(),
  });

  return {
    profile: query.data ?? null,
    isProfileComplete: query.data?.isProfileComplete ?? false,
    isLoading: query.isLoading,
    error: query.error ? "Failed to load profile" : null,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { telephone: string }) => apiService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};
