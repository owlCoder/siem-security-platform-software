import StatCard from "../stat_card/StatCard";
import { BsDatabase } from "react-icons/bs";
import { BiError } from "react-icons/bi";
import { PiShieldWarningBold } from "react-icons/pi";
import { IoShieldCheckmark } from "react-icons/io5";
import RecentEventsTable from "../tables/RecentEventsTable";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { EventRow } from "../../types/events/EventRow";
import { IQueryAPI } from "../../api/query/IQueryAPI";
import { IStorageAPI } from "../../api/storage/IStorageAPI";
interface DashboardProps{
    queryApi:IQueryAPI;
    storageApi:IStorageAPI;
}

export default function Dashboard({queryApi,storageApi}:DashboardProps) {
    const [eventsData, setEventsData] = useState<EventRow[]>([]);
    const [allEventsCount, setEventCount] = useState<number>(0);
    const [infoCount, setInfoCount] = useState<number>(0);
    const [warningCount, setWarningCount] = useState<number>(0);
    const [errorCount, setErrorCount] = useState<number>(0);
    const [mostEventType,setMostEventType]=useState("-");
    const [mostEventValue,setMostEventValue]=useState(0)
    const [mostWeightArchive,setMostWeightArchive]=useState("-");
    const [mostWeightArchiveValue,setMostWeightArchiveValue]=useState(0)
    const [topEvent,setTopEvent]=useState("-");
    const [topEventValue,setTopEventValue]=useState(0)
    //const { token } = useAuth();
    const token = "token";      // TODO: DELETE AFTER TESTING!

    // types, interfaces and classes will be moved too
    const getMostEventType=(infoCount:number,errorCount:number,warningCount:number)=>{  //moved this in utils functions like sorting
        const array=[infoCount,errorCount,warningCount];
        const max=Math.max(...array);
        setMostEventValue(max);
        if(max===infoCount){
            setMostEventType("Info");
        }else if(max===errorCount){
            setMostEventType("Error");
        }else if(max===warningCount){
            setMostEventType("Warning");
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            //if (!token) return;           // TODO: DELETE COMMENT AFTER TESTING
            try {
                const recentEvents = await queryApi.getLastThreeEvents(token);
                const mappedEvents: EventRow[] = recentEvents.map(event => ({
                    id: event.id,
                    source: event.source,
                    time: new Date(event.timestamp).toLocaleString(),
                    type: event.type,
                    description: event.description
                }));
                setEventsData(mappedEvents);
                const allEventsCount = await queryApi.getEventsCount(token);
                setEventCount(allEventsCount);

                const infoCount = await queryApi.getInfoCount(token);
                setInfoCount(infoCount);
                const warningCount = await queryApi.getWarningCount(token);
                setWarningCount(warningCount);
                const errorCount = await queryApi.getErrorCount(token);
                setErrorCount(errorCount);
                getMostEventType(infoCount,errorCount,warningCount);
                console.log("Ucitani events");
                const archive=await storageApi.getLargestArchive(token);
                console.log("Arhiva largest ",archive)
                setMostWeightArchive(archive.archiveName);
                setMostWeightArchiveValue(archive.size);       
                const event=await queryApi.getTopEventSource(token);
                console.log("Top event ",event);
                setTopEvent(event.source!);
                setTopEventValue(event.count!);      
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
        const interval=window.setInterval(fetchData,5000);
        return ()=>clearInterval(interval);
    }, [token]);

    return (
        <div className="border-2 border-[#282A28] bg-transparent rounded-[14px]">
            <h2 className="mt-[3px]! p-[5px]! m-[10px]!">Analytics</h2>
             <div className="grid grid-cols-12 gap-5 p-2!">
                <div className="col-span-3">
                    <StatCard title="Total Raw Events" value={allEventsCount} icon={<BsDatabase />} iconColor="#60cdff" />
                </div>

                <div className="col-span-3">
                    <StatCard title="Errors" value={errorCount} icon={<BiError />} iconColor="#ff4b4b" />
                </div>

                <div className="col-span-3">
                    <StatCard title="Warnings" value={warningCount} icon={<PiShieldWarningBold />} iconColor="#ffa500" />

                </div>

                <div className="col-span-3">
                    <StatCard title="Notifications" value={infoCount} icon={<IoShieldCheckmark />} iconColor="#4ade80" />

                </div>
            </div>
            <h2 className="mt-[10px]! p-[5px]! m-[10px]!">Short review</h2>
            <div className="flex items-center gap-5 height-[20%] width-[100%] p-[10px]!">
                <StatCard title="Top Event Source" subtitle={topEvent} value={topEventValue} valueDescription="events" />
                <StatCard title="Most Event Type" subtitle={mostEventType} value={mostEventValue} valueDescription="events" />
                <StatCard title="Most weight archive" subtitle={mostWeightArchive} value={mostWeightArchiveValue} valueDescription="MB" />
            </div>
            <h2 className="mt-[10px]! p-[5px]! m-[10px]!">Recent Events</h2>
            <RecentEventsTable events={eventsData} />
        </div>
    );
};
