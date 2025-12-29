export interface SearchToolBarProps {
    value: string;
    onSearchText: (searchText: string) => void;
    value1: string;
    onEventType: (eventType: string) => void;
    value2: string;
    onDateTo: (dateTo: string) => void;
    value3: string;
    onDateFrom: (dateFrom: string) => void;
    onSearchClick: () => void;
}