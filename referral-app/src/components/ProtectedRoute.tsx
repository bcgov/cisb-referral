import { Navigate } from "react-router-dom";
import { useProfile } from "../hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps): React.JSX.Element => {
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
