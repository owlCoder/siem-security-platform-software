import AllEventsTable from "../tables/AllEventsTable";
import React, { useState } from "react";
import { FiDownload } from "react-icons/fi";
interface EventRow { //move into a right folders (types)
    id: string;
    time: string;
    type: "Info" | "Warning" | "Error";
}
export default function Events() {
    const [searchText, setSearchText] = useState('');
    const [sortType, setSortType] = useState(0);
    const [transition, setTransition] = useState(false);
    const events: EventRow[] = [    //zamjeniti sa stvarnim podacima iz baze kad bude gotovo
        { id: "d66bc2ea-13ef-4a18-9ed0-b8038ef21b32", time: "01:23:33   22/11/2025", type: "Error" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Warning" },
        { id: "7fa98056-2dd3-4fbe-8e7c-2bb3ad892f45", time: "21:03:11   20/11/2025", type: "Error" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Info" },
        { id: "7fa98056-2dd3-4fbe-8e7c-2bb3ad892f45", time: "21:03:11   20/11/2025", type: "Error" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Warning" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Warning" },
        { id: "d66bc2ea-13ef-4a18-9ed0-b8038ef21b32", time: "01:23:33   22/11/2025", type: "Info" },
        { id: "7fa98056-2dd3-4fbe-8e7c-2bb3ad892f45", time: "21:03:11   20/11/2025", type: "Error" },
        { id: "d66bc2ea-13ef-4a18-9ed0-b8038ef21b32", time: "01:23:33   22/11/2025", type: "Info" },
        { id: "d66bc2ea-13ef-4a18-9ed0-b8038ef21b32", time: "01:23:33   22/11/2025", type: "Info" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Info" },
        { id: "51ac7386-394d-474e-b1f3-fb337c72e2b0", time: "01:25:49   22/11/2025", type: "Warning" },
        { id: "7fa98056-2dd3-4fbe-8e7c-2bb3ad892f45", time: "21:03:11   20/11/2025", type: "Error" },
    ];
    const eventDivStyle: React.CSSProperties = {
        border: "2px solid #d0d0d0",
        backgroundColor: "transparent",
        borderRadius: "14px",
        borderColor: "#d0d0d0",

    }
    const downloadStyle: React.CSSProperties = {
        backgroundColor: "transparent",
        borderRadius: "15px",
        width: "15%",
        color: "#d0d0d0",
        transition: transition ? "transform 0.3s ease-in" : 'transform 0.3s ease-in',
        transform: transition ? "scale(1.2)" : "scale(1.0)"

    }

    const containerStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "right",
        gap: "15px",
        marginInlineEnd: "15px"
    }

    const elementsStyle: React.CSSProperties = {
        background: "#d0d0d0",
        color: "#000000ff",
        width: "15%",
        borderRadius: "15px",
        padding: "4px"
        
    }

    return (
        <div style={eventDivStyle}>

            <h3 style={{ padding: "10px", margin: "10px" }}>Events</h3>
            <div style={containerStyle}>
                <select value={sortType} onChange={(e) => setSortType(Number(e.target.value))} style={elementsStyle}>
                    <option  value={0}>Sort by  &nbsp;&nbsp;&nbsp;▼</option>
                    <option value={1}>Event ID &nbsp;&nbsp;&nbsp;🡹</option> 
                    <option value={2}>Event ID &nbsp;&nbsp;&nbsp;🡻</option>
                    <option value={3}>Date and Time &nbsp;&nbsp;&nbsp;🡹</option>
                    <option value={4}>Date and Time &nbsp;&nbsp;&nbsp;🡻</option>
                    <option value={5}>Type &nbsp;&nbsp;&nbsp;🡹</option>
                    <option value={6}>Type &nbsp;&nbsp;&nbsp;🡻</option>
                </select>
                <input style={elementsStyle} placeholder="🔍Search by id" value={searchText} onChange={(e) => setSearchText(e.target.value.toString())} />
                <button style={downloadStyle} onMouseEnter={() => setTransition(true)} onMouseLeave={() => setTransition(false)}>Download report <FiDownload size={20} />
                </button>
            </div>
            <div style={{  margin: "10px" }}>
                <AllEventsTable events={events} sortType={sortType} searchText={searchText} />
            </div>
        </div>
    );
}