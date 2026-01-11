import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { PaginationProps } from "../../types/props/alerts/PaginationProps";
import { generatePageNumbers } from "../../helpers/pagination";

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex justify-between items-center px-5 py-4 bg-[#2a2a2a] border-t border-[#3a3a3a] rounded-b-[14px]">
      {/* Left section: Page size selector */}
      <div className="flex items-center gap-3 text-[13px] text-[#d0d0d0]">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2.5 py-1.5 rounded-[3px] border border-[#444] bg-[#1f1f1f] text-white text-[13px] cursor-pointer outline-none"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>

      {/* Center section: Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2.5 py-1.5 rounded-[3px] border text-[13px] flex items-center gap-1.5 transition-all ${currentPage === 1
              ? "opacity-40 cursor-not-allowed border-[#444] bg-[#1f1f1f] text-[#d0d0d0]"
              : "border-[#444] bg-[#1f1f1f] text-[#d0d0d0] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#60a5fa]"
            }`}
        >
          <IoChevronBack size={14} />
          Previous
        </button>

        {generatePageNumbers(currentPage, totalPages).map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="text-[#a6a6a6] px-1">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1.5 rounded-[3px] border text-[13px] min-w-[36px] text-center transition-all ${page === currentPage
                  ? "border-[#60a5fa] bg-[rgba(96,165,250,0.15)] text-[#60a5fa] font-semibold cursor-default"
                  : "border-[#444] bg-[#1f1f1f] text-[#d0d0d0] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#60a5fa]"
                }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2.5 py-1.5 rounded-[3px] border text-[13px] flex items-center gap-1.5 transition-all ${currentPage === totalPages
              ? "opacity-40 cursor-not-allowed border-[#444] bg-[#1f1f1f] text-[#d0d0d0]"
              : "border-[#444] bg-[#1f1f1f] text-[#d0d0d0] cursor-pointer hover:bg-[#2a2a2a] hover:border-[#60a5fa]"
            }`}
        >
          Next
          <IoChevronForward size={14} />
        </button>
      </div>

      {/* Right section: Info */}
      <div className="text-[13px] text-[#a6a6a6]">
        Showing {startItem}-{endItem} of {totalItems}
      </div>
    </div>
  );
};