export default function RiskScoreCard({score} : {score: number}) {
    const status =
        score < 30 ? "GOOD" :
        score < 70 ? "WARNING" : "CRITICAL";

    const getStatusColor = (val: number) => {
        if (val > 70) return "#c62828"; 
        if (val > 30) return "#fbc02d"; 
        return "#03c74b"; 
    };

    const activeColor = getStatusColor(score);

    return (
        <div className="rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6 flex flex-col items-center justify-center h-[200px] w-full">
            <h2 className="text-sm uppercase tracking-widest text-gray-400 ml-[10px]! mr-[10px]!">
                Latest risk score for entity
            </h2>

            <div className={`mt-4 text-6xl font-bold`} style={{ color: activeColor }}>
                {score}
            </div>

            <span className={`mt-2 text-lg font-semibold`} style={{ color: activeColor }}>
                {status}
            </span>
        </div>
    );
}