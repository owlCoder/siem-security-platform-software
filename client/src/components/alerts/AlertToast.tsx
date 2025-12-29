import React, { useEffect, useState } from "react";
import { PiWarningOctagonFill } from "react-icons/pi";
import { IoClose } from "react-icons/io5";
import { getSeverityColor } from "../../helpers/alertColorHelpers";
import { AlertToastProps } from "../../types/props/alerts/AlertToastProps";


export default function AlertToast({ alert, onClose, onViewDetails }: AlertToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto-close after 5 seconds with progress bar
    const duration = 5000;
    const interval = 50; // Update every 50ms
    const step = (100 / duration) * interval;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - step;
        if (newProgress <= 0) {
          clearInterval(progressTimer);
          onClose();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [onClose]);

  const severityColor = getSeverityColor(alert.severity);

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#1f1f1f",
    border: `2px solid ${severityColor}`,
    borderRadius: "12px",
    minWidth: "350px",
    maxWidth: "450px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)",
    zIndex: 9999,
    animation: "slideInFromRight 0.3s ease-out",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: `1px solid ${severityColor}44`,
  };

  const titleContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
    margin: 0,
  };

  const severityBadgeStyle: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: 600,
    background: `${severityColor}22`,
    color: severityColor,
    border: `1px solid ${severityColor}44`,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#fff",
    fontSize: "20px",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    opacity: 0.7,
    transition: "opacity 0.2s",
  };

  const contentStyle: React.CSSProperties = {
    padding: "16px",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#dcdcdc",
    lineHeight: "1.5",
    marginBottom: "12px",
  };

  const metaStyle: React.CSSProperties = {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#a6a6a6",
    marginBottom: "12px",
  };

  const viewButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${severityColor}`,
    background: `${severityColor}22`,
    color: severityColor,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const progressBarStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "3px",
    width: `${progress}%`,
    background: severityColor,
    transition: "width 0.05s linear",
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={toastStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={titleContainerStyle}>
            <PiWarningOctagonFill size={24} color={severityColor} />
            <div style={{ flex: 1 }}>
              <h4 style={titleStyle}>New Security Alert</h4>
            </div>
            <span style={severityBadgeStyle}>{alert.severity}</span>
          </div>
          <button
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
            style={closeButtonStyle}
          >
            <IoClose />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          <div style={descriptionStyle}>
            <strong>{alert.title}</strong>
          </div>

          <div style={metaStyle}>
            <div>
              <strong>Source:</strong> {alert.source}
            </div>
            <div>
              <strong>Time:</strong>{" "}
              {new Date(alert.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(alert.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${severityColor}33`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${severityColor}22`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
              style={viewButtonStyle}
            >
              👁️ View Details
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={progressBarStyle}></div>
      </div>
    </>
  );
}