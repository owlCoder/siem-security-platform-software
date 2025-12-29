import AllEventsTable from "../tables/AllEventsTable";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { EventDTO } from "../../models/events/EventDTO";
import { EventRow } from "../../types/events/EventRow";
import { SearchToolBar } from "../events/SearchToolBar";
import { SecondEventToolBar } from "../events/SecondEventToolBar";
import { mapEventDTO } from "../../helpers/mapEventDTO";
import { IQueryAPI } from "../../api/query/IQueryAPI";
import { IParserAPI } from "../../api/parser/IParserAPI";

interface EventsProps {
    queryApi: IQueryAPI;
    parserApi: IParserAPI;
}

export default function Events({ queryApi, parserApi }: EventsProps) {
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
        return mapEventDTO(e);
    };

    const loadEventsWithQuery = async () => {
        if (!token) {
            console.error("No auth token available.");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
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

            const data: EventDTO[] = await queryApi.getEventsByQuery(query, token);
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


                const data: EventDTO[] = await queryApi.getAllEvents(token);
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
            <SearchToolBar value={searchText} onSearchText={setSearchText} value1={eventType} onEventType={setEventType}
                value2={dateTo} onDateTo={setDateTo} value3={dateFrom} onDateFrom={setDateFrom} onSearchClick={loadEventsWithQuery} />

            <SecondEventToolBar onSortType={setSortType} />

            <div className="m-[10px]!">
                {error && !isLoading && (
                    <div className="text-red-400 text-[14px] ml-1!">
                        {error}
                    </div>
                )}

                <AllEventsTable events={events} sortType={sortType} searchText={searchText} parserApi={parserApi} />
            </div>
        </div>
    );
}
