import { MdCheckCircle, MdError } from "react-icons/md";
import { BackupValidationLogDTO } from "../../../models/backup/BackupValidationLogDTO";

interface Props {
    log: BackupValidationLogDTO;
}

export default function BackupLogsTableRow({ log }: Props){
    const tdClass = "px-4! py-3! text-center text-[#dcdcdc] text-[14px] border-b-[1px] border-b-[#2d2d2d]"
    const isSuccess = log.status === "SUCCESS";

    return(
        <tr className="transition-colors duration-200 cursor-pointer hover:bg-[#2a2a2a]">
            <td className={`${tdClass} w-[40px]`}>
                {isSuccess ? (
                    <MdCheckCircle size={22} className="text-[#4ade80]"/>
                ) : (
                    <MdError size={22} className="text-[#f87171]"/>
                )}
            </td>

            <td className={tdClass}>
                <span className={`font-semibold ${isSuccess ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                    {log.status}
                </span>
            </td>

            <td className={`${tdClass} text-left max-w-[400px] truncate`}>
                {log.errorMessage || "Backup creation successful."}
            </td>

            <td className={tdClass}>
                {new Date(log.createdAt).toLocaleString()}
            </td>
        </tr>
    );

}