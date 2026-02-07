import { FiDownload } from "react-icons/fi";
import { SearchBarProps } from "../../types/props/alerts/SearchBarProps";

const inputClass = "w-full px-3! py-2! rounded-[10px]! border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.3)]! text-white text-[13px] outline-none";

export default function SearchBar({
  searchText,
  onSearchTextChange,
  onSearch,
  onReset,
  onKeyPress,
  severity,
  status,
  dateFrom,
  dateTo
}: SearchBarProps) {

  const handleDownloadAlertsPdf = () => {
    const baseUrl = "http://localhost:5790/api/v1/query/alertsPdfReport";
    const sSeverity = String(severity || 'all');
    const sStatus = String(status || 'all');
    const sSource = String(searchText || '');
    const sDateFrom = dateFrom ? new Date(dateFrom).toISOString() : "";
    const sDateTo = dateTo ? new Date(dateTo).toISOString() : "";

    const queryParams = new URLSearchParams({
      severity: sSeverity,
      status: sStatus,
      source: sSource,
      dateFrom: sDateFrom,
      dateTo: sDateTo
    });

    const url = `${baseUrl}?${queryParams.toString()}`;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;

    document.body.appendChild(iframe);

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-[4px] col-span-4 w-full">
      <label className="px-1! block text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">
        Search Source
      </label>

      <div className="flex flex-col gap-2 w-full">
        <input
          type="text"
          placeholder="Search by..."
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          onKeyDown={onKeyPress} // Promenjeno sa onKeyPress u onKeyDown (moderniji React)
          className={inputClass}
        />

        <div className="flex gap-2 w-full">
          <button
            onClick={onSearch}
            className="w-[33.3%] h-[38px] rounded-[10px]! bg-[#007a55]! hover:bg-[#009166]! text-white text-[13px] font-semibold cursor-pointer transition-all"
          >
            Search
          </button>

          <button
            onClick={onReset}
            className="w-[33.3%] h-[38px] rounded-[10px]! bg-[#313338]! hover:bg-[#404249]! text-white text-[13px] font-semibold cursor-pointer transition-all"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleDownloadAlertsPdf}
            className="w-[33.3%] h-[38px] flex items-center justify-center gap-2 rounded-[10px]! bg-[#007a55]! hover:bg-[#009166]! text-white text-[13px] font-semibold cursor-pointer transition-all"
          >
            PDF <FiDownload size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}