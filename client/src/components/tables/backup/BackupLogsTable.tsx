import { BackupValidationLogDTO } from "../../../models/backup/BackupValidationLogDTO";
import BackupLogsTableRow from "./BackupLogsTableRow";

interface Props {
    logs: BackupValidationLogDTO[];
}

export default function BackupLogsTable({ logs }: Props) {
    const thClass = "px-4! py-3! text-center text-[#d0d0d0] font-semibold text-[13px] border-b border-[#3a3a3a] uppercase tracking-[0.5px]";
    return(
      <div className="bg-[#1f1f1f] rounded-[10px]! overflow-hidden shadow-md border border-[#333]">
            <div className="max-h-[320px] overflow-y-auto relative">
                <table className="w-full border-collapse text-[14px]">
                    <thead className="bg-[#2a2a2a] sticky top-0">
                        <tr>
                            <th className={`${thClass} w-[40px]`}></th>
                            <th className={thClass}>Status</th>
                            <th className={thClass}>Message</th>
                            <th className={thClass}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-10 text-center text-[#a6a6a6]">
                                    No backup logs found
                                </td>
                            </tr>
                        ): (
                            logs.map(log => (
                                <BackupLogsTableRow key={log.backupValidationLogId} log={log} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>  
    );
}