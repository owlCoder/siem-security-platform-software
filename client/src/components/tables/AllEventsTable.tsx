import { useEffect, useState } from "react";
import EventTableRow from "./AllEventsTableRow";
import { EventRow } from "../../types/events/EventRow";
import { EventsTableProps } from "../../types/props/events/EventsTableProps";


export default function AllEventsTable({ events, sortType, searchText, parserApi }: EventsTableProps) {
    const [sortedEvents, setSortedEvents] = useState<EventRow[]>(events);
    // const [rotateArrow, setRotateArrow] = useState<number | null>(null);

    useEffect(() => {
        let copy = [...events];

        if (sortType === 1) {       //maybe move in utils
            copy.sort((a, b) => a.source.localeCompare(b.source));
        } else if (sortType === 2) {
            copy.sort((a, b) => b.source.localeCompare(a.source));
        } else if (sortType === 3) {
            copy.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        } else if (sortType === 4) {
            copy.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        } else if (sortType === 5) {
            copy.sort((a, b) => a.type.localeCompare(b.type));
        } else if (sortType === 6) {
            copy.sort((a, b) => b.type.localeCompare(a.type));
        }

        setSortedEvents(copy);
    }, [searchText, sortType, events]);

    return (
        <div className="bg-[#1f1f1f] rounded-[14px] mt-4! overflow-hidden shadow-md border border-[#333]">

            <table className="w-full border-collapse font-sans text-[14px]!">
                <thead className="bg-[#2a2a2a]">
                    <tr>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Source</th>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Date and Time</th>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Type</th>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]"></th>
                    </tr>
                </thead>

                <tbody>
                    {sortedEvents.length == 0 ? (<tr>
                        <td colSpan={7} className="px-10 py-10 text-center border-b border-[#2d2d2d] text-[#a6a6a6]">
                            No events found
                        </td>
                    </tr>) : (sortedEvents.map((e, index) => (
                        <EventTableRow
                            key={e.id}
                            e={e}
                            index={index}
                            parserApi={parserApi} />
                    )))}
                </tbody>
            </table>
        </div>
    );
}
