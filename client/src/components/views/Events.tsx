import AllEventsTable from "../tables/AllEventsTable";
import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuthHook";
import { EventAPI } from "../../api/events/EventAPI";
import { EventDTO } from "../../models/events/EventDTO";

interface EventRow { 
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}

export default function Events() {
    const { token } = useAuth();

    const [searchText, setSearchText] = useState("");
    const [sortType, setSortType] = useState(0);
    const [transition, setTransition] = useState(false);
    const [events, setEvents] = useState<EventRow[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const eventDivStyle: React.CSSProperties = {
        border: "2px solid #d0d0d0",
        backgroundColor: "transparent",
        borderRadius: "14px",
        borderColor: "#d0d0d0",
    };

    const downloadStyle: React.CSSProperties = {
        backgroundColor: "transparent",
        borderRadius: "15px",
        width: "15%",
        color: "#d0d0d0",
        transition: transition ? "transform 0.3s ease-in" : "transform 0.3s ease-in",
        transform: transition ? "scale(1.2)" : "scale(1.0)",
    };

    const containerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "right",
        gap: "15px",
        marginInlineEnd: "15px",
    };

    const elementsStyle: React.CSSProperties = {
        background: "#d0d0d0",
        color: "#000000ff",
        width: "15%",
        borderRadius: "15px",
        padding: "4px",
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
                type = "Error";
                break;
            case "WARNING":
                type = "Warning";
                break;
            case "INFO":
            default:
                type = "Info";
                break;
        }

        return {
            id: e.id.toString(),
            time: formatTime(e.timestamp),
            type,
        };
    };

    useEffect(() => {
        if (!token) return;

        const api = new EventAPI();

        const loadEvents = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // prazan query => Query Service vraća sve eventove
                const data: EventDTO[] = await api.getAllEvents(token);
                const mapped: EventRow[] = data.map(mapEventDTOToRow);

                setEvents(mapped);
            } catch (err) {
                console.error("Failed to load events:", err);
                setError("Failed to load events.");
            } finally {
                setIsLoading(false);
            }
        };

        void loadEvents();
    }, [token]);

    return (
        <div style={eventDivStyle}>
            <h3 style={{ padding: "10px", margin: "10px" }}>Events</h3>

            <div style={containerStyle}>
                <select
                    value={sortType}
                    onChange={(e) => setSortType(Number(e.target.value))}
                    style={elementsStyle}
                >
                    <option value={0}>Sort by  &nbsp;&nbsp;&nbsp;▼</option>
                    <option value={1}>Event ID &nbsp;&nbsp;&nbsp;🡹</option>
                    <option value={2}>Event ID &nbsp;&nbsp;&nbsp;🡻</option>
                    <option value={3}>Date and Time &nbsp;&nbsp;&nbsp;🡹</option>
                    <option value={4}>Date and Time &nbsp;&nbsp;&nbsp;🡻</option>
                    <option value={5}>Type &nbsp;&nbsp;&nbsp;🡹</option>
                    <option value={6}>Type &nbsp;&nbsp;&nbsp;🡻</option>
                </select>

                <input
                    style={elementsStyle}
                    placeholder="🔍Search by id"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value.toString())}
                />

                <button
                    style={downloadStyle}
                    onMouseEnter={() => setTransition(true)}
                    onMouseLeave={() => setTransition(false)}
                >
                    Download report <FiDownload size={20} />
                </button>
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
