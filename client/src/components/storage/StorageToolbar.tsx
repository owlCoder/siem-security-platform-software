import { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

type Props = {
    onSearch: (query: string) => void;
    onSort: (by: "date" | "size" | "name", order: "asc" | "desc") => void;
}

export default function StorageToolBar({ onSearch, onSort }: Props) {
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
    const [order, setOrder] = useState<"asc" | "desc">("asc");

    useEffect(() => {
        onSearch(query);
    }, [query]);

    useEffect(() => {
        onSort(sortBy, order);
    }, [sortBy, order]);

    const CONTROL_HEIGHT = "36px";

    const toolBarWrapper: React.CSSProperties = {
        display: "flex",
        justifyContent: "flex-end",
        padding:"5px",
        margin: "16px 0"
    };

    const controlsGrid: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "auto auto 1fr auto",
        gap: "12px",
        alignItems: "center",
        width: "80%",
        maxWidth: "800px"
    };

    const searchWrapperStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#2a2a2a",
        padding: "0 12px",
        borderRadius: "20px",
        border: "1px solid #3a3a3a",
        width: "100%",
        height: CONTROL_HEIGHT
    };

    const inputStyle: React.CSSProperties = {
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#ffffff",
        width: "100%",
        height: "100%",
        fontSize: "13px"
    };

    const selectStyle: React.CSSProperties = {
        background: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: "20px",
        padding: "0 12px",
        color: "#ffffff",
        fontSize: "13px",
        cursor: "pointer",
        height: CONTROL_HEIGHT

    };

    const orderButtonStyle: React.CSSProperties = {
        background: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: "20px",
        height: CONTROL_HEIGHT,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        flexShrink: 0
    };

    const searchButtonStyle: React.CSSProperties = {
        height: CONTROL_HEIGHT,
        padding: "0 18px",
        borderRadius: "20px",
        border: "1px solid #60cdff",
        background: "#60cdff",
        color: "#000",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        flexShrink: 0
    }

    return (
        <div style={toolBarWrapper}>
            <div style={controlsGrid}>

                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    style={selectStyle}
                >
                    <option value="date">Date</option>
                    <option value="size">Size</option>
                    <option value="name">Name</option>
                </select>

                <button
                    style={orderButtonStyle}
                    onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                    title={order === "asc" ? "Ascending" : "Descending"}
                >
                    {order === "asc" ? (
                        <IoIosArrowUp size={16} />
                    ) : (
                        <IoIosArrowDown size={16} />
                    )}
                </button>

                <div style={searchWrapperStyle}>
                    <AiOutlineSearch size={16} color="#a6a6a6" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <button
                    style={searchButtonStyle}
                    onClick={() => onSearch(query)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#3b82f6";
                        e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#60cdff";
                        e.currentTarget.style.color = "#000000"
                    }}
                >
                    Search
                </button>
            </div>
        </div>
    );
}