import { useState } from "react";

interface FirewallRuleManagerProps {
    addRule: (ipAddress: string, port: number) => Promise<void>;
}

export default function FirewallRuleManager({ addRule }: FirewallRuleManagerProps) {
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState<number | "">("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleAdd = async () => {
        if (!ipAddress || port === "") {
            setMessage({ text: "Please enter valid IP and port.", isError: true });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            await addRule(ipAddress, Number(port));
            setMessage({ text: "Rule added successfully!", isError: false });
            setIpAddress("");
            setPort("");
        } catch (err) {
            console.error("Failed to add rule", err);
            setMessage({ text: "Failed to add rule.", isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 justify-center items-center gap-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-semibold mb-6 self-center">
                Add Firewall Rule
            </h3>

            <input
                type="text"
                placeholder="IP Address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white placeholder:text-[#a6a6a6] focus:outline-none focus:border-[#007a55] transition-colors duration-200"
            />

            <input
                type="number"
                placeholder="Port"
                value={port}
                onChange={(e) => setPort(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-4 py-2 rounded-[10px] border-2 border-[#333] bg-[#1f1f1f] text-white placeholder:text-[#a6a6a6] focus:outline-none focus:border-[#007a55] transition-colors duration-200"
            />

            <button
                onClick={handleAdd}
                disabled={isSaving}
                className={`w-full px-5 py-2 rounded-[10px] text-white text-sm font-semibold transition-all duration-200 ${isSaving ? "bg-[#313338] cursor-not-allowed" : "bg-[#007a55] hover:bg-[#008b65]"
                    }`}
            >
                {isSaving ? "Adding..." : "Add Rule"}
            </button>

            {message && (
                <div className="text-sm text-green-500 mt-2">
                    {message.text}
                </div>
            )}
        </div>
    );
}