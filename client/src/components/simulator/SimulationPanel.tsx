import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuth } from "../../hooks/useAuthHook";
import { SimulationDTO, SimulationType } from "../../models/simulator/SimulationDTO";
import { ISimulatorAPI, SimulationRequestDTO } from "../../api/simulator/ISimulatorAPI";

type SimulationPanelProps = {
  simulatorApi: ISimulatorAPI;
};

const typeOptions: { value: SimulationType; label: string }[] = [
  { value: "BRUTE_FORCE", label: "Brute-force" },
  { value: "PRIVILEGE_ESCALATION", label: "Privilege escalation" },
  { value: "DDOS", label: "DDoS" },
];

export function SimulationPanel({ simulatorApi }: SimulationPanelProps) {
  const { token } = useAuth();

  const [type, setType] = useState<SimulationType>("BRUTE_FORCE");
  const [intensity, setIntensity] = useState<number>(5);
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [target, setTarget] = useState<string>("auth-service");
  const [activeSimulation, setActiveSimulation] = useState<SimulationDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const timelineData = useMemo(() => {
    if (!activeSimulation) return [];
    return activeSimulation.timeline.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString(),
      count: point.count,
    }));
  }, [activeSimulation]);

  const startSimulation = async () => {
    if (!token) {
      setError("No auth token available.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: SimulationRequestDTO = {
        type,
        intensity,
        durationSeconds,
        target: target.trim() ? target.trim() : undefined,
      };
      const result = await simulatorApi.startSimulation(payload, token);
      setActiveSimulation(result);
    } catch (err) {
      console.error(err);
      setError("Failed to start simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    if (!token || !activeSimulation) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await simulatorApi.stopSimulation(activeSimulation.id, token);
      setActiveSimulation(result);
    } catch (err) {
      console.error(err);
      setError("Failed to stop simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSimulation = async () => {
    if (!token || !activeSimulation) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await simulatorApi.getSimulation(activeSimulation.id, token);
      setActiveSimulation(result);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh simulation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#1f2123] border-2 border-[#282A28] rounded-[12px] px-8 py-7 mb-4">

      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2c2c2c]">
        <h3 className="text-white text-lg font-semibold">
          Security Incident Simulator
        </h3>

        {activeSimulation && (
          <span className="text-xs text-[#a6a6a6] bg-[#1f1f1f] px-3 py-1 rounded-lg border border-[#333]">
            ID: {activeSimulation.id}
          </span>
        )}
      </div>

      {/* INPUT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 pt-6 pb-6 border-b border-[#2c2c2c]">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#a6a6a6]">Type</label>
          <select
            className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55] transition-colors duration-200"
            value={type}
            onChange={(e) => setType(e.target.value as SimulationType)}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#a6a6a6]">Intensity (events/sec)</label>
          <input
            type="number"
            min={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#a6a6a6]">Duration (sec)</label>
          <input
            type="number"
            min={1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[#a6a6a6]">Target</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="auth-service"
            className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white placeholder:text-[#a6a6a6] text-sm focus:outline-none focus:border-[#007a55]"
          />
        </div>
      </div>

      {/* BUTTONS + STATUS */}
      <div className="flex flex-wrap items-center gap-3 pt-5 pb-5 border-b border-[#2c2c2c]">
        <button
          onClick={startSimulation}
          disabled={isLoading}
          className={`px-5 py-2 rounded-[10px] text-white text-sm font-semibold transition-all duration-200 ${isLoading
              ? "bg-[#313338] cursor-not-allowed"
              : "bg-[#007a55] hover:bg-[#008b65]"
            }`}
        >
          Start
        </button>

        <button
          onClick={stopSimulation}
          disabled={!activeSimulation || isLoading}
          className={`px-5 py-2 rounded-[10px] text-white text-sm font-semibold transition-all duration-200 ${!activeSimulation || isLoading
              ? "bg-[#313338] cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
            }`}
        >
          Stop
        </button>

        <button
          onClick={refreshSimulation}
          disabled={!activeSimulation || isLoading}
          className={`px-5 py-2 rounded-[10px] text-white text-sm font-semibold transition-all duration-200 ${!activeSimulation || isLoading
              ? "bg-[#313338] cursor-not-allowed"
              : "bg-[#1f6feb] hover:bg-[#2a7fff]"
            }`}
        >
          Refresh
        </button>

        {activeSimulation && (
          <div className="ml-3 text-xs text-[#a6a6a6]">
            Status:{" "}
            <span className="text-white font-semibold">
              {activeSimulation.status}
            </span>
            <span className="mx-2 text-[#555]">|</span>
            Events:{" "}
            <span className="text-[#00ff88] font-semibold">
              {activeSimulation.eventsGenerated}
            </span>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="pt-4 text-sm font-semibold text-red-500">
          {error}
        </div>
      )}

      {/* CHART */}
      <div className="pt-6">
        <div className="h-[200px] bg-[#1f2123] rounded-[10px] border border-[#333] p-4">
          {timelineData.length === 0 ? (
            <div className="text-xs text-[#666] flex items-center justify-center h-full">
              No simulation data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <XAxis dataKey="time" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00ff88"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );

}
