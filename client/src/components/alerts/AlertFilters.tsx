import React, { useState } from "react";
import { AlertSeverity } from "../../enums/AlertSeverity";
import { AlertStatus } from "../../enums/AlertStatus";
import { AlertQueryDTO } from "../../models/alerts/AlertQueryDTO";
import { SelectFilters } from "./SelectFilters";
import { SearchBar } from "./SearchBar";

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
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="mb-6">
      <div className="grid grid-cols-12 gap-3 mb-3">
        <SelectFilters
          severity={severity}
          status={status}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSeverityChange={setSeverity}
          onStatusChange={setStatus}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />
        <SearchBar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          onSearch={handleSearch}
          onReset={handleReset}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="h-4"></div>
    </div>
  );
};
