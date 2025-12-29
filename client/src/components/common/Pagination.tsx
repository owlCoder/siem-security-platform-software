import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { PaginationProps } from "../../types/props/alerts/PaginationProps";


export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "#2a2a2a",
    borderTop: "1px solid #3a3a3a",
    borderRadius: "0 0 14px 14px",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
    color: "#d0d0d0",
  };

  const selectStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#1f1f1f",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
  };

  const centerSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const pageButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    borderRadius: "6px",
    border: active ? "1px solid #60a5fa" : "1px solid #444",
    background: active ? "rgba(96, 165, 250, 0.15)" : "#1f1f1f",
    color: active ? "#60a5fa" : "#d0d0d0",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    cursor: active ? "default" : "pointer",
    transition: "all 0.2s",
    minWidth: "36px",
    textAlign: "center",
  });

  const navButtonStyle: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#1f1f1f",
    color: "#d0d0d0",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  };

  const disabledNavButtonStyle: React.CSSProperties = {
    ...navButtonStyle,
    opacity: 0.4,
    cursor: "not-allowed",
  };

  const infoStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#a6a6a6",
  };

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={containerStyle}>
      {/* Left section: Page size selector */}
      <div style={leftSectionStyle}>
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={selectStyle}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>

      {/* Center section: Page navigation */}
      <div style={centerSectionStyle}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledNavButtonStyle : navButtonStyle}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = "#2a2a2a";
              e.currentTarget.style.borderColor = "#60a5fa";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = "#1f1f1f";
              e.currentTarget.style.borderColor = "#444";
            }
          }}
        >
          <IoChevronBack size={14} />
          Previous
        </button>

        {generatePageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} style={{ color: "#a6a6a6", padding: "0 4px" }}>
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              style={pageButtonStyle(page === currentPage)}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.background = "#2a2a2a";
                  e.currentTarget.style.borderColor = "#60a5fa";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  e.currentTarget.style.background = "#1f1f1f";
                  e.currentTarget.style.borderColor = "#444";
                }
              }}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledNavButtonStyle : navButtonStyle}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.background = "#2a2a2a";
              e.currentTarget.style.borderColor = "#60a5fa";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.background = "#1f1f1f";
              e.currentTarget.style.borderColor = "#444";
            }
          }}
        >
          Next
          <IoChevronForward size={14} />
        </button>
      </div>

      {/* Right section: Info */}
      <div style={infoStyle}>
        Showing {startItem}-{endItem} of {totalItems}
      </div>
    </div>
  );
};