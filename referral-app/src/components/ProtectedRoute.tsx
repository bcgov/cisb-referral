import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "../hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isProfileComplete, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
