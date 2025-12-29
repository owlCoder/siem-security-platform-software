export interface StorageToolBarProps {
    onSearch: (query: string) => void;
    onSort: (by: "date" | "size" | "name", order: "asc" | "desc") => void;
}