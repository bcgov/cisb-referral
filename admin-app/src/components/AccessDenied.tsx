import { Header, Footer } from "@bcgov/design-system-react-components";
import { logout } from "../auth";

export function AccessDenied() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="CISB Referral App" />
      <main className="flex-1 bg-bcgov-gray-light flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
          <h1 className="text-xl font-semibold text-bcgov-gray-dark mb-3">
            Access denied
          </h1>
          <p className="text-bcgov-gray-dark mb-6">
            Your account is not authorized. Please contact your administrator to
            request access.
          </p>
          <button
            type="button"
            onClick={logout}
            className="py-2 px-4 bg-bcgov-blue text-white rounded font-medium
              hover:bg-bcgov-blue-dark focus:outline-none focus:ring-2
              focus:ring-bcgov-blue transition-colors"
          >
            Logout
          </button>
        </div>
      </main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
