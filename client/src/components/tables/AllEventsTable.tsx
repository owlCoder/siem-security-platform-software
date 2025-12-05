import { useEffect, useState } from "react";
import EventTableRow from "./EventTableRow";

interface EventRow {
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}

// Inline styles for now, will be in CSS later
// types, interfaces and classes will be moved too

interface Arguments {
    events: EventRow[],
    sortType?: number,
    searchText?: string
}

export default function AllEventsTable({ events, sortType, searchText }: Arguments) {
    const [sortedEvents, setSortedEvents] = useState<EventRow[]>(events);
    // const [rotateArrow, setRotateArrow] = useState<number | null>(null);

    useEffect(() => {
        let copy = [...events];
        if (searchText && searchText.trim() !== "") {
            copy = copy.filter(item =>
                item.id.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (sortType === 1) {
            copy.sort((a, b) => a.id.localeCompare(b.id));
        } else if (sortType === 2) {
            copy.sort((a, b) => b.id.localeCompare(a.id));
        } else if (sortType === 3) {
            copy.sort((a, b) => a.time.localeCompare(b.time));
        } else if (sortType === 4) {
            copy.sort((a, b) => b.time.localeCompare(a.time));
        } else if (sortType === 5) {
            copy.sort((a, b) => a.type.localeCompare(b.type));
        } else if (sortType === 6) {
            copy.sort((a, b) => b.type.localeCompare(a.type));
        }

        setSortedEvents(copy);
    }, [searchText, sortType, events]);
    const containerStyle: React.CSSProperties = {
        background: "#1f1f1f",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        marginTop: "12px",
        border: "1px solid #333",
    };

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "14px",
    };

    const theadStyle: React.CSSProperties = {
        background: "#2a2a2a",
    };

    const thStyle: React.CSSProperties = {
        padding: "12px 16px",
        textAlign: "left",
        color: "#d0d0d0",
        fontWeight: 600,
        fontSize: "14px",
        borderBottom: "1px solid #3a3a3a",
    };

    return (
        <div style={containerStyle}>

            <table style={tableStyle}>
                <thead style={theadStyle}>
                    <tr>
                        <th style={thStyle}>Event ID</th>
                        <th style={thStyle}>Time</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}></th>
                    </tr>
                </thead>

                <tbody>
                    {sortedEvents.map((e, index) => (
                        <><EventTableRow e={e} index={index} />

                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
