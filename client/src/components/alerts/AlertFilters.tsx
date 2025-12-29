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

  const handleReset = () => {
    setSearchText("");
    setSeverity(undefined);
    setStatus(undefined);
    setSortBy('createdAt');
    setSortOrder('DESC');
    onSearch({ page: 1, limit: 10 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.3)",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.3)",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 24px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007a55",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "#a6a6a6",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 600,
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* First Row: Filters and Search */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "12px", marginBottom: "12px" }}>
        {/* Severity */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Severity</label>
          <select
            value={severity || ""}
            onChange={(e) => setSeverity(e.target.value as AlertSeverity || undefined)}
            style={selectStyle}
          >
            <option value="">All</option>
            <option value={AlertSeverity.LOW}>Low</option>
            <option value={AlertSeverity.MEDIUM}>Medium</option>
            <option value={AlertSeverity.HIGH}>High</option>
            <option value={AlertSeverity.CRITICAL}>Critical</option>
          </select>
        </div>

        {/* Status */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={status || ""}
            onChange={(e) => setStatus(e.target.value as AlertStatus || undefined)}
            style={selectStyle}
          >
            <option value="">All</option>
            <option value={AlertStatus.ACTIVE}>Active</option>
            <option value={AlertStatus.INVESTIGATING}>Investigating</option>
            <option value={AlertStatus.RESOLVED}>Resolved</option>
            <option value={AlertStatus.DISMISSED}>Dismissed</option>
            <option value={AlertStatus.ESCALATED}>Escalated</option>
          </select>
        </div>

        {/* Sort By */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={selectStyle}
          >
            <option value="createdAt">Date & Time</option>
            <option value="severity">Severity</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort Order */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            style={selectStyle}
          >
            <option value="DESC">Newest First ↓</option>
            <option value="ASC">Oldest First ↑</option>
          </select>
        </div>

        {/* Search Input */}
        <div style={{ gridColumn: "span 4" }}>
          <label style={labelStyle}>Search Source</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Search by source..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={handleKeyPress}
              style={inputStyle}
            />
            <button
              onClick={handleSearch}
              style={buttonStyle}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width="16"
                  height="16"
                  style={{ color: "#ffffff" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                  />
                </svg>
                Search
              </span>
            </button>
            <button
              onClick={handleReset}
              style={buttonStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
