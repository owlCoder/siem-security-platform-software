import { RecommendationPriority, SecurityMaturityRecommendationDTO } from "../../models/security-maturity/SecurityMaturityRecommendationDTO";


const priorityColorMap: Record<RecommendationPriority, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#facc15",
  LOW: "#22c55e",
};

export default function RecommendationCard({
  recommendation,
}: {
  recommendation: SecurityMaturityRecommendationDTO;
}) {
  return (
    <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-5 flex flex-col gap-3 m-4!">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-200">
          {recommendation.title}
        </h3>

        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{
            backgroundColor: priorityColorMap[recommendation.priority],
            color: "#000",
          }}
        >
          {recommendation.priority}
        </span>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed">
        {recommendation.description}
      </p>

      {recommendation.targetMaturityLevel && (
        <div className="text-xs uppercase tracking-widest text-gray-500 mt-2">
          Target maturity:{" "}
          <span className="text-gray-300 font-semibold">
            {recommendation.targetMaturityLevel.replace("_", " ")}
          </span>
        </div>
      )}
    </div>
  );
}
