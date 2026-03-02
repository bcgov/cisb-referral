export interface Tab {
  readonly id: string;
  readonly label: string;
}

interface TabsProps {
  readonly tabs: readonly Tab[];
  readonly activeTab: string;
  readonly onTabChange: (tabId: string) => void;
}

/**
 * Horizontally scrollable tab bar for responsive layouts.
 */
export function Tabs({ tabs, activeTab, onTabChange }: Readonly<TabsProps>) {
  return (
    <div
      className="flex bg-white border-b border-bcgov-border overflow-x-auto [&]:[-webkit-overflow-scrolling:touch]"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`py-3 px-4 sm:px-6 bg-transparent border-0 border-b-3 text-sm font-medium
            cursor-pointer transition-all whitespace-nowrap
            hover:text-bcgov-gray-dark hover:bg-gray-100
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bcgov-blue ${
              activeTab === tab.id
                ? "text-bcgov-blue border-b-bcgov-blue"
                : "text-bcgov-gray border-b-transparent"
            }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
