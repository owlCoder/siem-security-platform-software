import AllEventsTable from "../tables/AllEventsTable";
import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuthHook";
import { EventDTO } from "../../models/events/EventDTO";
import { EventType } from "../../enums/EventType";
import DropDownMenu from "../events/DropDownMenu";
import { QueryAPI } from "../../api/query/QueryAPI";
import { EventRow } from "../../types/events/EventRow";

export default function Events() {
    /*const eventss: EventRow[] = [
            { id: 1, source: "Auth Service", time: "01:23:33   22/11/2025", type: EventType.INFO, description: "User login successful" },
            { id: 2, source: "Auth Service", time: "01:25:49   22/11/2025", type: EventType.WARNING, description: "Multiple failed login attempts" },
            { id: 3, source: "Database", time: "21:03:11   20/11/2025", type: EventType.ERROR, description: "Database connection lost" },
        ];*/
    //const { token } = useAuth();
    const token = "token";      // TODO: DELETE AFTER TESTING!

    const [searchText, setSearchText] = useState("");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [eventType, setEventType] = useState<string>("all");

    const [sortType, setSortType] = useState(0);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const eventDivStyle: React.CSSProperties = {
        border: "2px solid #282A28",
        backgroundColor: "transparent",
        borderRadius: "14px",
        borderColor: "#282A28",
    };

    const downloadStyle: React.CSSProperties = {
        backgroundColor: "#d0d0d0",
        borderRadius: "15px",
        width: "200px",
        color: "#000",
    };

    const firstRowStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "right",
        marginInlineEnd: "10px",
        gap: "12px"
    };

    const elementsStyle: React.CSSProperties = {
        background: "#d0d0d0",
        color: "#000",
        width: "200px",
        borderRadius: "15px",
        padding: "4px",
        height: "40px",
        fontWeight: 500
    };

    const searchInputStyle: React.CSSProperties = {
        ...elementsStyle,
        width: "200px",
    };

    const dateInputStyle: React.CSSProperties = {
        ...elementsStyle,
        width: "200px",
    };

    const selectStyle: React.CSSProperties = {
        ...elementsStyle,
        width: "200px",
        marginLeft: "15px"
    };

    const secondRowStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "row",
        margin: "10px",
    };

    const leftSideStyle: React.CSSProperties = {
        display: "flex",
        gap: "10px",
        justifyContent: "left",
        width: "100%",
        alignItems: "center",
    };


    const rightSideStyle: React.CSSProperties = {
        display: "flex",
        gap: "10px",
        justifyContent: "right",
        width: "100%",
        alignItems: "center",
    };

    const liHoverStyle: React.CSSProperties = {
        backgroundColor: "#9ca3af", // gray-400
    };

    const formatTime = (iso: string): string => {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return iso;

        const pad = (n: number) => n.toString().padStart(2, "0");

        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const day = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const year = date.getFullYear();

        // isti stil kao pre: "HH:MM:SS   DD/MM/YYYY"
        return `${hours}:${minutes}:${seconds}   ${day}/${month}/${year}`;
    };

    const mapEventDTOToRow = (e: EventDTO): EventRow => {
        let type: EventRow["type"];
        switch (e.type) {
            case "ERROR":
                type = EventType.ERROR;
                break;
            case "WARNING":
                type = EventType.WARNING;
                break;
            case "INFO":
            default:
                type = EventType.INFO;
                break;
        }

        return {
            id: e.id,
            source: e.source.toString(),
            time: formatTime(e.timestamp),
            type,
            description: e.description.toString(),
        };
    };

    const loadEventsWithQuery = async () => {
        if (!token) {
            console.error("No auth token available.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const api = new QueryAPI();

            // pravi se query za search
            // npr: text=server
            let query =
                searchText && searchText.trim() !== ""
                    ? `text=${searchText}`
                    : "";


            // dodaje se dateFrom
            if (dateFrom && dateFrom.trim() !== "") {
                const fromDate = new Date(dateFrom);
                query += query ? `|dateFrom=${fromDate.toISOString()}` : `dateFrom=${fromDate.toISOString()}`;
            }

            // dodaje se dateTo
            if (dateTo && dateTo.trim() !== "") {
                const toDate = new Date(dateTo);
                query += query ? `|dateTo=${toDate.toISOString()}` : `dateTo=${toDate.toISOString()}`;
            }

            // dodaje se eventType
            if (eventType && eventType !== "all") {
                query += query ? `|type=${eventType.toUpperCase()}` : `type=${eventType.toUpperCase()}`;
            }

            const data: EventDTO[] = await api.getEventsByQuery(query, token);
            const mapped = data.map(mapEventDTOToRow);

            setEvents(mapped);
        } catch (err) {
            console.error(err);
            setError("Search failed.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        //if (!token) return;       // TODO: DELETE COMMENT AFTER TESTING!

        const loadAllEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const api = new QueryAPI();

                const data: EventDTO[] = await api.getAllEvents(token);
                const mapped = data.map(mapEventDTOToRow);
                setEvents(mapped);
            } catch (err) {
                console.error(err);
                setError("Failed to load events.");
            } finally {
                setIsLoading(false);
            }
        };

        void loadAllEvents();
    }, [token]);

    return (
        <div style={eventDivStyle}>
            <h2 style={{ marginTop: '3px', padding: "5px", margin: "10px" }}>Events</h2>

            <div style={firstRowStyle}>
                <div style={{ display: "grid", gridTemplateRows: "repeat(2,1fr)" }}>
                    <label >Date from:</label>
                    <input
                        style={dateInputStyle}
                        type="datetime-local"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div style={{ display: "grid", gridTemplateRows: "repeat(2,1fr)" }}>
                    <label >Date to:</label>
                    <input
                        style={dateInputStyle}
                        type="datetime-local"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>

            </div>
            <div style={secondRowStyle}>
                <div style={leftSideStyle}>
                    <input
                        style={searchInputStyle}
                        placeholder="Type..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value.toString())}
                    />
                    <button
                        style={elementsStyle}
                        onClick={() => loadEventsWithQuery()}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, liHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, downloadStyle)}
                    >
                        Search
                    </button>
                </div>
                <div style={rightSideStyle}>
                    <div>
                        <select
                            style={selectStyle}
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, liHoverStyle)}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, selectStyle)}>
                            <option value="all">All types</option>
                            <option value="info">Informations</option>
                            <option value="warning">Warnings</option>
                            <option value="error">Errors</option>
                        </select>
                    </div>
                    <DropDownMenu OnSortTypeChange={(value: number) => setSortType(value)} />
                    <button
                        style={downloadStyle}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, liHoverStyle)}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, downloadStyle)}
                    >
                        Download report <FiDownload size={20} />
                    </button>
                </div>
            </div>

            <div style={{ margin: "10px" }}>
                {isLoading && (
                    <div style={{ marginBottom: "8px", color: "#d0d0d0" }}>
                        Loading events...
                    </div>
                )}

                {error && !isLoading && (
                    <div style={{ marginBottom: "8px", color: "#ff4d4f" }}>
                        {error}
                    </div>
                )}

                <AllEventsTable events={events} sortType={sortType} searchText={searchText} />
            </div>
        </div>
    );
}
