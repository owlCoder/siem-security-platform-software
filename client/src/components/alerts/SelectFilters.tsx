import { AlertSeverity } from "../../enums/AlertSeverity";
import { AlertStatus } from "../../enums/AlertStatus";
import { SelectFiltersProps } from "../../types/props/alerts/SelectFiltersProps";

const selectClass = "w-full px-1 h-10 rounded-[10px] border border-white/20 bg-black/30 text-white text-[10px] outline-none";

export default function SelectFilters ({
  severity,
  status,
  sortBy,
  sortOrder,
  onSeverityChange,
  onStatusChange,
  onSortByChange,
  onSortOrderChange
}:SelectFiltersProps) {
  return (
    <>
      <div className="col-span-2">
        <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Severity</label>
        <select value={severity || ""} onChange={(e) => onSeverityChange(e.target.value as AlertSeverity || undefined)} className={selectClass}>
          <option value="">All</option>
          <option value={AlertSeverity.LOW}>Low</option>
          <option value={AlertSeverity.MEDIUM}>Medium</option>
          <option value={AlertSeverity.HIGH}>High</option>
          <option value={AlertSeverity.CRITICAL}>Critical</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Status</label>
        <select value={status || ""} onChange={(e) => onStatusChange(e.target.value as AlertStatus || undefined)} className={selectClass}>
          <option value="">All</option>
          <option value={AlertStatus.ACTIVE}>Active</option>
          <option value={AlertStatus.INVESTIGATING}>Investigating</option>
          <option value={AlertStatus.RESOLVED}>Resolved</option>
          <option value={AlertStatus.DISMISSED}>Dismissed</option>
          <option value={AlertStatus.ESCALATED}>Escalated</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Sort By</label>
        <select value={sortBy} onChange={(e) => onSortByChange(e.target.value as any)} className={selectClass}>
          <option value="createdAt">Date & Time</option>
          <option value="severity">Severity</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="col-span-2">
        <label className="block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">Order</label>
        <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as any)} className={selectClass}>
          <option value="DESC">Newest First ↓</option>
          <option value="ASC">Oldest First ↑</option>
        </select>
      </div>
    </>
  );
};
