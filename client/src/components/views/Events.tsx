import AllEventsTable from "../tables/AllEventsTable";
import { useEffect, useState } from "react";
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
            time: e.timestamp,
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
                console.log("aaaaaaaa ", mapped[0].time)
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
        <div className="bg-transparent border-2 border-solid rounded-[14px] border-[#282A28]">
            <h2 className="mt-[3px]! p-[5px]! m-[10px]!" >Events</h2>
            <div className="flex justify-end me-[10px]!" >
                <div className={`flex w-[150px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold
            ${!isLoading
                        ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
                        : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
                    }`}>
                    <div
                        className={`w-2 h-2 rounded-[14px]! ${!isLoading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"}`}
                    ></div>
                    {!isLoading ? "Live Updates Active" : "Connecting..."}
                </div>

            </div>
            <div className="flex justify-start gap-[16px] ml-[10px]!">
                <div className="flex gap-[20px]! items-center mt-[40px]!">
                    <input
                        className="flex-1 px-3! py-2! h-[40px]! rounded-[15px]! w-[400px] border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d]! text-white text-[13px] outline-none"
                        placeholder="Type..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                </div>
                <div className="grid grid-rows-2">
                    <label>Type:</label>
                    <select
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d]! hover:bg-[#9ca3af]! text-white! w-[200px]! rounded-[15px]! p-[4px]! h-[40px]! font-semibold"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                    >
                        <option value="all">All types</option>
                        <option value="info">Informations</option>
                        <option value="warning">Warnings</option>
                        <option value="error">Errors</option>
                    </select>
                </div>
                <div className="grid grid-rows-2">
                    <label >Date from:</label>
                    <input
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d]! text-white text-[#000] w-[200px] rounded-[15px] p-[4px]! h-[40px] font-semibold"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="grid grid-rows-2">
                    <label >Date to:</label>
                    <input
                        className="border border-[rgba(255,255,255,0.12)] bg-[#2d2d2d]! text-white w-[200px] rounded-[15px] p-[4px]! h-[40px] font-semibold"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                <button
                    className="bg-[#007a55] text-color w-[200px] rounded-[15px]! p-[4px] h-[40px] mt-[40px]! font-semibold hover:bg-[#9ca3af]"
                    onClick={loadEventsWithQuery}
                >
                    Search
                </button>

            </div>
            <div className="flex justify-end items-center mt-4! me-[10px]!">

                <div className="flex gap-[16px] items-center">


                    <DropDownMenu OnSortTypeChange={(value: number) => setSortType(value)} sortName1="Source" sortName2="Date and Time" sortName3="Type" />

                    <button className="bg-[#007a55] text-white w-[200px] h-[40px] rounded-[15px]! font-semibold flex items-center justify-center gap-2 hover:bg-[#9ca3af]">
                        Download report <FiDownload size={20} />
                    </button>
                </div>
            </div>


            <div className="m-[10px]!">
                {error && !isLoading && (
                    <div className="text-red-400 text-[14px] ml-1!">
                        {error}
                    </div>
                )}

                <AllEventsTable events={events} sortType={sortType} searchText={searchText} />
            </div>
        </div>
    );
}
