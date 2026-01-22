import { useEffect, useState } from "react";

import FirewallModeSwitcher from "../firewall/FirewallModeSwitcher";
import FirewallRuleManager from "../firewall/FirewallRuleManager";
import FirewallRulesTable from "../firewall/FirewallRulesTable";
import FirewallLogsTable from "../firewall/FirewallLogsTable";
import FirewallConnectionTester from "../firewall/FirewallConnectionTester";
import { IFirewallAPI } from "../../api/firewall/IFirewallAPI";
import { FirewallModeDTO } from "../../types/firewall/FirewallModeDTO";
import { FirewallRuleDTO } from "../../types/firewall/FirewallRuleDTO";
import { FirewallLogDTO } from "../../types/firewall/FirewallLogDTO";

interface FirewallViewProps {
    firewallApi: IFirewallAPI;
}

export default function Firewall({ firewallApi }: FirewallViewProps) {
    const [mode, setMode] = useState<FirewallModeDTO>({ mode: "WHITELIST" });
    const [rules, setRules] = useState<FirewallRuleDTO[]>([]);
    const [logs, setLogs] = useState<FirewallLogDTO[]>([]);

    // Load initial data
    const loadInitialData = async () => {
        try {
            const [fMode, fRules, fLogs] = await Promise.all([
                firewallApi.getMode(),
                firewallApi.getAllRules(),
                firewallApi.getAllLogs(),
            ]);
            setMode(fMode);
            setRules(fRules);
            setLogs(fLogs);
        } catch (err) {
            console.error("Failed to load firewall data", err);
        };
    }

    useEffect(() => {
        void loadInitialData();
    }, []);

    // Handlers for subcomponents
    const handleModeSave = async (newMode: "WHITELIST" | "BLACKLIST") => {
        try {
            const updated = await firewallApi.setMode(newMode);
            setMode({ mode: updated.mode });
        } catch (err) {
            console.error("Failed to update mode", err);
        }
    };

    const handleAddRule = async (ip: string, port: number) => {
        try {
            const newRule = await firewallApi.addRule(ip, port);
            setRules((prev) => [...prev, newRule]);
        } catch (err) {
            console.error("Failed to add rule", err);
            throw err;      // Propagate error for component to show
        }
    };

    const handleDeleteRule = async (id: number) => {
        try {
            await firewallApi.deleteRule(id);
            setRules((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    const handleTestConnection = async (ip: string, port: number) => {
        return await firewallApi.testConnection(ip, port);
    };

    return (
        <div className="p-6 flex flex-col gap-3">

            {/* Row 1: Firewall Mode (full width) */}
            <div className="flex flex-col justify-center items-center min-h-[180px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                <FirewallModeSwitcher
                    mode={mode}
                    onSave={handleModeSave}
                />
            </div>

            {/* Row 2: Add Rule + Test Connection */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="flex flex-col justify-center items-center min-h-[320px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <FirewallRuleManager
                        addRule={handleAddRule}
                    />
                </div>

                <div className="flex flex-col justify-center items-center min-h-[320px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6">
                    <FirewallConnectionTester
                        testConnection={handleTestConnection}
                    />
                </div>
            </div>

            {/* Row 3: Firewall Rules + Logs */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <div className="flex flex-col justify-center items-center min-h-[400px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6 overflow-hidden">
                    <FirewallRulesTable
                        rules={rules}
                        deleteRule={handleDeleteRule}
                    />
                </div>

                <div className="flex flex-col justify-center items-center min-h-[400px] max-h-[380px] rounded-lg border-2 border-[#282A28] bg-[#1f2123] p-6 overflow-y-auto">
                    <FirewallLogsTable logs={logs} />
                </div>
            </div>

        </div>
    );
}