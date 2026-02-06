import { ServiceStatusDTO } from "../../models/status-monitor/ServiceStatusDTO";
import { PiCheckCircleFill, PiWarningOctagonFill } from "react-icons/pi";

interface Props {
    service: ServiceStatusDTO;
}

export default function UptimeBar({ service }: Props) {
    const isDown = service.isDown;
    const statusColor = isDown ? "text-[#ff4b4b]" : "text-[#007a55]";
    const borderColor = isDown ? "border-[rgba(255,75,75,0.3)]" : "border-[rgba(0,122,85,0.3)]";
    const bgColor = isDown ? "bg-[rgba(255,75,75,0.15)]" : "bg-[rgba(0,122,85,0.15)]";
    
    const StatusIcon = isDown ? PiWarningOctagonFill : PiCheckCircleFill;
    const statusText = isDown ? "OUTAGE DETECTED" : "OPERATIONAL";

    return (
        <div className="bg-transparent rounded-[14px] border-2 border-[#282A28] p-4! shadow-sm hover:border-[#3a3a3a] transition-all">
            
            {/* Header: Service Name + Status Badge */}
            <div className="flex justify-between items-center mb-4!">
                <h3 className="text-white text-[16px] font-semibold m-0">{service.serviceName}</h3>
                
                <div className={`flex items-center gap-2 px-3! py-1.5! rounded-[8px] border ${borderColor} ${bgColor}`}>
                    <StatusIcon className={statusColor} size={18} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${statusColor}`}>
                        {statusText}
                    </span>
                </div>
            </div>

            {/* Uptime History Section */}
            <div className="mt-3!">
                <div className="flex justify-between text-[11px] text-[#888] mb-2! font-semibold uppercase tracking-wider">
                    <span>30 days ago</span>
                    <span>Today</span>
                </div>
                
                <div className="flex gap-[3px] h-10 w-full">
                    {(service.history || Array(30).fill({ hasIncident: false })).map((day, index) => {
                        let barColor = "bg-[#007a55]"; 
                        let tooltipText = `${day.date || 'Day ' + (index + 1)}: Operational`;

                        if (day.hasIncident) {
                            barColor = "bg-[#eab308]"; 
                            tooltipText = `${day.date || 'Day ' + (index + 1)}: Incident reported (${day.incidentCount || 1} times)`;
                        }

                        if (index === 29 && isDown) {
                            barColor = "bg-[#ff4b4b]";
                            tooltipText = "Today: Current Outage";
                        }

                        return (
                            <div 
                                key={index}
                                className={`flex-1 rounded-[4px] ${barColor} hover:opacity-80 transition-all cursor-help relative group`}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-[#1f1f1f] text-white text-[11px] py-1.5 px-3 rounded-lg border border-[#333] z-10 whitespace-nowrap shadow-xl">
                                    {tooltipText}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
