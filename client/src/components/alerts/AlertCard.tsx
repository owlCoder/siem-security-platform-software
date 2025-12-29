import { AlertCardProps } from "../../types/props/alerts/AlertCardProps";

export default function AlertCard({ measurementUnit, color, message }: AlertCardProps) {

    return (<div className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-5! border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px]">
        <div
            className={`font-bold ${message === "Last Alert"
                ? "text-[20px] mt-3!"
                : "text-[28px]"
                }`}
            style={{ color }}
        >
            {measurementUnit}
        </div>

        <div className="text-[12px] text-[#a6a6a6] mt-1!">{message}</div>
    </div>);
}