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

            <div className="flex justify-start gap-[14px] ml-[10px]!">
                <div className="flex gap-[20px]! items-center mt-[40px]!">
                    <input
                        className="bg-[#d0d0d0] text-black w-[200px] rounded-[15px]! p-[4px] h-[40px] font-semibold"
                        placeholder="Type..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <div className="grid grid-rows-2">
                    <label>Type:</label>
                    <select
                        className="bg-[#d0d0d0]! text-black! w-[200px]! rounded-[15px]! p-[4px]! h-[40px] font-semibold"
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
                        className="bg-[#d0d0d0] text-[#000] w-[200px] rounded-[15px] p-[4px]! h-[40px] font-semibold"
                        type="datetime-local"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="grid grid-rows-2">
                    <label >Date to:</label>
                    <input
                        className="bg-[#d0d0d0] text-[#000] w-[200px] rounded-[15px] p-[4px]! h-[40px] font-semibold"
                        type="datetime-local"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                <button
                    className="bg-[#d0d0d0] text-black w-[200px] rounded-[15px]! p-[4px] h-[40px] mt-[40px]! font-semibold hover:bg-[#9ca3af]"
                    onClick={loadEventsWithQuery}
                >
                    Search
                </button>

            </div>
            <div className="flex justify-end items-center mt-4! me-[10px]!">

                <div className="flex gap-[10px] items-center">


                    <DropDownMenu OnSortTypeChange={(value: number) => setSortType(value)} />

                    <button className="bg-[#d0d0d0] text-black w-[200px] h-[40px] rounded-[15px]! font-semibold flex items-center justify-center gap-2 hover:bg-[#9ca3af]">
                        Download report <FiDownload size={20} />
                    </button>
                </div>
            </div>


            <div className="m-[10px]!">
                {isLoading && (
                    <div className="mb-[8px]! text-white">
                        Loading events...
                    </div>
                )}

                {error && !isLoading && (
                    <div className="mb-[8px]! text-red">
                        {error}
                    </div>
                )}

                <AllEventsTable events={events} sortType={sortType} searchText={searchText} />
            </div>
        </div>
    );
}
