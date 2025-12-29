import React, { useState } from "react";
import { AlertStatus } from "../../enums/AlertStatus";
import { IoClose } from "react-icons/io5";
import { getSeverityColor, getStatusColor } from "../../helpers/alertColorHelpers";
import { AlertDetailsPanelProps } from "../../types/props/alerts/AlertDetailsPanelProps";


export default function AlertDetailsPanel({
  alert: alertData,
  onClose,
  onResolve
}: AlertDetailsPanelProps) {
  const [resolvedBy, setResolvedBy] = useState("");

  const handleResolve = () => {
    if (!resolvedBy.trim()) {
      alert("Please enter your name");
      return;
    }
    onResolve(alertData.id, resolvedBy);
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const panelStyle: React.CSSProperties = {
    background: "#1f1f1f",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflow: "auto",
    border: "1px solid #333",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #333",
    background: "#2a2a2a",
    borderRadius: "16px 16px 0 0",
  };

  const contentStyle: React.CSSProperties = {
    padding: "24px",
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: "20px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#a6a6a6",
    marginBottom: "6px",
    display: "block",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#fff",
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    color: color,
    background: `${color}22`,
    border: `1px solid ${color}44`,
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Alert Details</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: "24px",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoClose />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* ID & Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Alert ID</label>
            <div style={{ ...valueStyle, fontFamily: "Consolas, monospace", color: "#60cdff" }}>
              #{alertData.id}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Title</label>
            <div style={{ ...valueStyle, fontSize: "18px", fontWeight: 600 }}>
              {alertData.title}
            </div>
          </div>

          {/* Severity & Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Severity</label>
              <span style={badgeStyle(getSeverityColor(alertData.severity))}>
                {alertData.severity}
              </span>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <span style={badgeStyle(getStatusColor(alertData.status))}>
                {alertData.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <div style={{ ...valueStyle, lineHeight: "1.6" }}>
              {alertData.description}
            </div>
          </div>

          {/* Source */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Source</label>
            <div style={valueStyle}>{alertData.source}</div>
          </div>

          {/* Correlated Events */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Correlated Events ({alertData.correlatedEvents.length})</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              {alertData.correlatedEvents.map((eventId) => (
                <span
                  key={eventId}
                  style={{
                    padding: "4px 10px",
                    background: "rgba(96, 165, 250, 0.15)",
                    border: "1px solid rgba(96, 165, 250, 0.3)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontFamily: "Consolas, monospace",
                    color: "#60a5fa",
                  }}
                >
                  #{eventId}
                </span>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={labelStyle}>Created At</label>
              <div style={valueStyle}>
                {new Date(alertData.createdAt).toLocaleString()}
              </div>
            </div>
            {alertData.resolvedAt && (
              <div>
                <label style={labelStyle}>Resolved At</label>
                <div style={valueStyle}>
                  {new Date(alertData.resolvedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Resolved By */}
          {alertData.resolvedBy && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Resolved By</label>
              <div style={valueStyle}>{alertData.resolvedBy}</div>
            </div>
          )}

          {/* Action Section */}
          {alertData.status !== AlertStatus.RESOLVED && alertData.status !== AlertStatus.DISMISSED && (
            <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #333" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Resolve Alert</h3>
              <input
                type="text"
                placeholder="Your name or email"
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  background: "#2a2a2a",
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              />
              <button
                onClick={handleResolve}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4ade80",
                  color: "#000",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✓ Resolve Alert
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}