import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "../components/ui";
import {
  ReferralDetailsTab,
  ReferrerIndividualTab,
  AuditHistoryTab,
} from "../components/referral";
import { apiService } from "../services";

type TabType = "details" | "referrer-individual" | "related";

const TABS = [
  { id: "details", label: "Referral Details" },
  { id: "referrer-individual", label: "Referrer & Individual Info" },
  { id: "related", label: "Audit History" },
] as const;

export function ReferralDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const queryClient = useQueryClient();

  const {
    data: referral,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["referral", id],
    queryFn: () => {
      if (!id) throw new Error("Referral ID is required");
      return apiService.fetchReferral(id);
    },
    enabled: !!id,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiService.fetchUsers(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading referral...</p>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">
          Error loading referral. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <div className="flex flex-col gap-2">
          <Link
            to="/referrals"
            className="text-bcgov-link no-underline text-sm hover:underline"
          >
            ← Back to Referrals
          </Link>
          <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
            Referral #{id?.substring(0, 8)}
          </h1>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      <div className="p-6 bg-gray-100 flex-1">
        {activeTab === "details" && (
          <ReferralDetailsTab
            key={referral.id}
            referral={referral}
            users={users}
            onUpdate={() =>
              queryClient.invalidateQueries({ queryKey: ["referral", id] })
            }
          />
        )}
        {activeTab === "referrer-individual" && (
          <ReferrerIndividualTab
            key={referral.id}
            referral={referral}
            onUpdate={() =>
              queryClient.invalidateQueries({ queryKey: ["referral", id] })
            }
          />
        )}
        {activeTab === "related" && <AuditHistoryTab />}
      </div>
    </div>
  );
}
