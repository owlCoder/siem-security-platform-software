import { RiskLevelBadgeProps } from "../../types/props/insider-threat/RiskLevelBadgeProps";

const getRiskColor = (level: string): string => {
  switch (level) {
    case "CRITICAL": return "#DC2626";
    case "HIGH": return "#EA580C";
    case "MEDIUM": return "#F59E0B";
    case "LOW": return "#10B981";
    default: return "#6B7280";
  }
};

export default function RiskLevelBadge({ level, size = "md" }: RiskLevelBadgeProps) {
  const color = getRiskColor(level);
  
  const sizeClasses = {
    sm: "px-2! py-1! text-[10px]",
    md: "px-2.5! py-1.5! text-[12px]",
    lg: "px-3! py-2! text-[14px]"
  };

  return (
    <span
      className={`${sizeClasses[size]} rounded-[8px] font-semibold inline-block border`}
      style={{
        backgroundColor: `${color}22`,
        color: color,
        borderColor: `${color}44`,
      }}
    >
      {level}
    </span>
  );
}