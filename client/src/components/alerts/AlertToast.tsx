import React, { useEffect, useState } from "react";
import { AlertDTO } from "../../models/alerts/AlertDTO";
import { AlertSeverity } from "../../enums/AlertSeverity";
import { PiWarningOctagonFill } from "react-icons/pi";
import { IoClose } from "react-icons/io5";

interface AlertToastProps {
  alert: AlertDTO;
  onClose: () => void;
}

export default function AlertToast({ alert, onClose }: AlertToastProps) {
  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return "#ff4b4b";
      case AlertSeverity.HIGH: return "#ffa500";
      case AlertSeverity.MEDIUM: return "#ffd700";
      case AlertSeverity.LOW: return "#4ade80";
      default: return "#60a5fa";
    }
  };

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#1f1f1f",
    border: `2px solid ${getSeverityColor(alert.severity)}`,
    borderRadius: "12px",
    padding: "16px",
    minWidth: "350px",
    maxWidth: "450px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    animation: "slideIn 0.3s ease-out",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  };

  const titleStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
  };

  return (<div></div>) //uraditi!!!
}
