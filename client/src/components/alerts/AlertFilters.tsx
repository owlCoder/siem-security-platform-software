import React, { useState } from "react";
import { AlertSeverity } from "../../enums/AlertSeverity";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";

interface AlertFiltersProps {
  onSearch: (query: AlertQueryDTO) => void;
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity | undefined>();
  const [status, setStatus] = useState<AlertStatus | undefined>();
  const [sortBy, setSortBy] = useState<'createdAt' | 'severity' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const handleSearch = () => {
    const query: AlertQueryDTO = {
      severity,
      status,
      source: searchText || undefined,
      sortBy,
      sortOrder,
      page: 1,
      limit: 10
    };
    onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-4!">
        {/* Severity Filter */}
        <select
          value={severity || ""}
          onChange={(e) => setSeverity(e.target.value as AlertSeverity || undefined)}
          className="w-full px-3! py-2! rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
        >
          <option value="">All Severities</option>
          <option value={AlertSeverity.LOW}>Low</option>
          <option value={AlertSeverity.MEDIUM}>Medium</option>
          <option value={AlertSeverity.HIGH}>High</option>
          <option value={AlertSeverity.CRITICAL}>Critical</option>
        </select>

        {/* Status Filter */}
        <select
          value={status || ""}
          onChange={(e) => setStatus(e.target.value as AlertStatus || undefined)}
          className="w-full px-3! py-2! rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
        >
          <option value="">All Statuses</option>
          <option value={AlertStatus.ACTIVE}>Active</option>
          <option value={AlertStatus.INVESTIGATING}>Investigating</option>
          <option value={AlertStatus.RESOLVED}>Resolved</option>
          <option value={AlertStatus.DISMISSED}>Dismissed</option>
          <option value={AlertStatus.ESCALATED}>Escalated</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full px-3! py-2! rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
        >
          <option value="createdAt">Date & Time</option>
          <option value="severity">Severity</option>
          <option value="status">Status</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="w-full px-3! py-2! rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
        >
          <option value="DESC">Descending ⬇</option>
          <option value="ASC">Ascending ⬆</option>
        </select>
      </div>

      <div className="flex gap-3 mb-6!">
        <input
          type="text"
          placeholder="Search by source..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3! py-2! rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none"
        />

        <button
          onClick={handleSearch}
          className="px-6! py-2! rounded-lg! bg-[#007a55]! text-white text-[13px] font-semibold cursor-pointer transition-all duration-200"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#5db9ea";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#60cdff";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          🔍 Search
        </button>
      </div>
    </>
  );
};