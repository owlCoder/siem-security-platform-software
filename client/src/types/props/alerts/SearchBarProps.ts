export interface SearchBarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}