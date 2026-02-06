import { useEffect, useState } from "react";
import { StatusDashboardProps } from "../../types/props/status-monitor/StatusDashboardProps";
import { ServiceStatusDTO } from "../../models/status-monitor/ServiceStatusDTO";
import { IncidentDTO } from "../../models/status-monitor/IncidentDTO";
import UptimeBar from "../../components/status-monitor/UptimeBar";
import IncidentTable from "../../components/status-monitor/IncidentTable";

export default function StatusDashboard({ statusApi }: StatusDashboardProps) {
  const [services, setServices] = useState<ServiceStatusDTO[]>([]);
  const [incidents, setIncidents] = useState<IncidentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = "token"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusData = await statusApi.getOverallStatus(token);
        setServices(statusData);
        const incidentData = await statusApi.getAllIncidents(token);
        setIncidents(incidentData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [statusApi]);

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="spinner"></div>
        <p className="text-gray-400 mt-4">Loading System Status...</p>
      </div>
    );
  }

  const activeIncidents = incidents.filter(i => !i.endTime).length;
  const totalServices = services.length;
  const operationalServices = services.filter(s => !s.isDown).length;

  return (
    <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-3! relative">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-[24px]!">
        <h2 className="m-0">System Status & Health</h2>
        <div className="flex items-center gap-3">
          <div
            className={`flex w-[150px]! items-center gap-2 px-3! py-1.5! rounded-[8px] text-[12px] font-semibold ${
              !loading
                ? "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.3)]"
                : "bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)]"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                !loading ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171] animate-none"
              }`}
            ></div>
            {!loading ? "Live Monitoring" : "Connecting..."}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6!">
        <div className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-5! border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px]">
          <div className="font-bold text-[28px]" style={{ color: operationalServices === totalServices ? "#4ade80" : "#f87171" }}>
            {operationalServices}/{totalServices}
          </div>
          <div className="text-[12px] text-[#a6a6a6] mt-1!">Services Operational</div>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-5! border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px]">
          <div className="font-bold text-[28px]" style={{ color: activeIncidents > 0 ? "#ff4b4b" : "#4ade80" }}>
            {activeIncidents}
          </div>
          <div className="text-[12px] text-[#a6a6a6] mt-1!">Active Incidents</div>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] rounded-[12px] p-5! border border-[rgba(255,255,255,0.1)] backdrop-blur-[10px]">
          <div className="font-bold text-[20px] mt-3!" style={{ color: "#4ade80" }}>
            99.8%
          </div>
          <div className="text-[12px] text-[#a6a6a6] mt-1!">Overall Uptime</div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6!">
        {services.map((service) => (
          <UptimeBar key={service.serviceName} service={service} />
        ))}
      </div>

      {/* Incidents Table */}
      <IncidentTable incidents={incidents} />
    </div>
  );
}
