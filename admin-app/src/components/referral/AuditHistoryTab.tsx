import { Section } from "../ui";

export function AuditHistoryTab() {
  return (
    <Section title="Audit History">
      <p className="text-amber-800 bg-amber-100 border border-amber-200 rounded p-3 text-sm mb-4">
        This section is only visible to system administrators.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Date/Time
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Action
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Field Changed
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Old Value
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                New Value
              </th>
              <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-bcgov-gray-dark">
                Changed By
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center text-bcgov-gray p-8">
                No audit history available.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  );
}
