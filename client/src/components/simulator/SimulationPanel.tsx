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
  const { token, user } = useAuth();
  const hasSimulatorAccess = useMemo(() => {
    const role = user?.role;
    if (role === undefined || role === null) {
      return false;
    }

    const normalized = String(role).toLowerCase();
    return normalized === "1" || normalized === "sys_admin" || normalized === "sysadmin";
  }, [user?.role]);

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
    if (!hasSimulatorAccess) {
      setError("Simulator is available only for SysAdmin users.");
      return;
    }

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
    if (!hasSimulatorAccess) {
      setError("Simulator is available only for SysAdmin users.");
      return;
    }

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
    if (!hasSimulatorAccess) {
      setError("Simulator is available only for SysAdmin users.");
      return;
    }

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
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between pb-6 border-b border-[#3a3a3a]">
        <h3 className="text-white text-base font-semibold tracking-tight">
          Security Incident Simulator
        </h3>

        {activeSimulation && (
          <span className="text-xs text-gray-400 bg-[#1f1f1f] px-3 py-1.5 rounded-lg border border-[#3a3a3a] font-mono">
            ID: {activeSimulation.id}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 pb-6 border-b border-[#3a3a3a]">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Type
          </label>
          <select
            className="w-full px-4 py-3 rounded-lg border-2 border-[#282A28] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55] transition-colors duration-200"
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

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Intensity (events/sec)
          </label>
          <input
            type="number"
            min={1}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border-2 border-[#282A28] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55] transition-colors duration-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Duration (sec)
          </label>
          <input
            type="number"
            min={1}
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border-2 border-[#282A28] bg-[#1f1f1f] text-white text-sm focus:outline-none focus:border-[#007a55] transition-colors duration-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Target
          </label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="auth-service"
            className="w-full px-4 py-3 rounded-lg border-2 border-[#282A28] bg-[#1f1f1f] text-white placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#007a55] transition-colors duration-200"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-6 pb-6 border-b border-[#3a3a3a]">
        <button
          onClick={startSimulation}
          disabled={isLoading}
          className={`px-5 py-3 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-sm ${isLoading
            ? "bg-[#2a2a2a] cursor-not-allowed opacity-50"
            : "bg-[#007a55] hover:bg-[#008b65]"
            }`}
        >
          Start
        </button>

        <button
          onClick={stopSimulation}
          disabled={!activeSimulation || isLoading}
          className={`px-5 py-3 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-sm ${!activeSimulation || isLoading
            ? "bg-[#2a2a2a] cursor-not-allowed opacity-50"
            : "bg-red-600 hover:bg-red-700"
            }`}
        >
          Stop
        </button>

        <button
          onClick={refreshSimulation}
          disabled={!activeSimulation || isLoading}
          className={`px-5 py-3 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-sm ${!activeSimulation || isLoading
            ? "bg-[#2a2a2a] cursor-not-allowed opacity-50"
            : "bg-[#1f6feb] hover:bg-[#2a7fff]"
            }`}
        >
          Refresh
        </button>

        {activeSimulation && (
          <div className="ml-2 text-xs text-gray-400">
            <span className="uppercase tracking-wider font-semibold">Status:</span>{" "}
            <span className="text-white font-semibold">
              {activeSimulation.status}
            </span>
            <span className="mx-2 text-[#3a3a3a]">|</span>
            <span className="uppercase tracking-wider font-semibold">Events:</span>{" "}
            <span className="text-green-500 font-semibold">
              {activeSimulation.eventsGenerated}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="pb-6 mb-6 text-sm font-semibold text-red-500 border-b border-[#3a3a3a]">
          {error}
        </div>
      )}

      <div>
        <div className="h-[240px] bg-[#1f1f1f] rounded-lg border-2 border-[#282A28] p-5">
          {timelineData.length === 0 ? (
            <div className="text-sm text-gray-500 flex items-center justify-center h-full">
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
