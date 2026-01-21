import { EventRow } from "../../../types/events/EventRow";
import { RecentEventsTableRow } from "./RecentEventsTableRow";

export default function RecentEventsTable({ events }: { events: EventRow[] }) {

    return (
        <div className="bg-[#1f1f1f] rounded-[14px] overflow-hidden shadow-lg border border-[#333] m-2.5! mt-3!">
            <table className="w-full border-collapse font-sans text-[14px]">
                <thead className="bg-[#2a2a2a]">
                    <tr>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Source</th>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Date and Time</th>
                        <th className="px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]">Type</th>
                    </tr>
                </thead>

                <tbody>
                    {events.map((e, index) => (
                        <RecentEventsTableRow e={e} index={index} key={e.id}/>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
