import { useState, useEffect } from "react";
import { FirewallModeDTO } from "../../types/firewall/FirewallModeDTO";

interface FirewallModeSwitcherProps {
    mode: FirewallModeDTO;
    onSave: (newMode: "WHITELIST" | "BLACKLIST") => Promise<void>;
}

export default function FirewallModeSwitcher({ mode, onSave }: FirewallModeSwitcherProps) {
    const [selectedMode, setSelectedMode] = useState<"WHITELIST" | "BLACKLIST">(mode.mode);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSelectedMode(mode.mode); // Update local state if mode changes from parent
    }, [mode]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(selectedMode);
        } catch (err) {
            console.error("Failed to save firewall mode", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6">
            <h3 className="text-white text-lg font-semibold mb-6 self-center">
                Firewall Mode
            </h3>

            <div className="flex flex-col flex-1 justify-center items-center gap-6">
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-white font-medium">
                        <input
                            type="radio"
                            name="firewallMode"
                            value="WHITELIST"
                            checked={selectedMode === "WHITELIST"}
                            onChange={() => setSelectedMode("WHITELIST")}
                            className="accent-[#007a55] w-4 h-4"
                        />
                        Whitelist
                    </label>

                    <label className="flex items-center gap-2 text-white font-medium">
                        <input
                            type="radio"
                            name="firewallMode"
                            value="BLACKLIST"
                            checked={selectedMode === "BLACKLIST"}
                            onChange={() => setSelectedMode("BLACKLIST")}
                            className="accent-[#007a55] w-4 h-4"
                        />
                        Blacklist
                    </label>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-5 py-2 rounded-[10px] text-white text-sm font-semibold transition-all duration-200 ${isSaving ? "bg-[#313338] cursor-not-allowed" : "bg-[#007a55] hover:bg-[#008b65]"
                        }`}
                >
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}