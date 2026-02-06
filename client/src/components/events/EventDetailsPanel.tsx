import { IoClose } from "react-icons/io5";
import { EventRow } from "../../types/events/EventRow";
import { IParserAPI } from "../../api/parser/IParserAPI";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuthHook";

interface PropsEvent {
    parserApi: IParserAPI;
    onClose: () => void;
    e: EventRow;
}

export default function EventDetailsPanel({
    parserApi,
    onClose,
    e
}: PropsEvent) {
    const { token } = useAuth();
    const [rawMsg, setRawMsg] = useState<string>();

    useEffect(() => {
        if (!token) return;

        const loadEventRawMessage = async () => {
            if (!e || !e.id) return;
            try {
                console.log(e.id);
                const res = await parserApi.getParserEventById(e.id, token);
                setRawMsg(res.text_before_parsing || "No raw message");
            } catch (err) {
                console.error(err);
                setRawMsg("Currently not available.");
            }
        };

        void loadEventRawMessage();
    }, [token, e]);
    const badgeClass = (color: string) =>
        `inline-block px-3 py-1 text-sm font-semibold text-[${color}] `;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-lg flex justify-center items-center z-[1000]"
            onClick={onClose}
        >
            <div
                className="bg-[#1f1f1f]  rounded-2xl w-[90%] max-w-[700px] max-h-[100vh]! overflow-auto border border-[#333] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                onClick={(ev) => ev.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[#333] bg-[#2a2a2a] rounded-t-2xl">
                    <div></div>
                    <h2 className="m-0 text-xl">Event Details</h2>
                    <button
                        onClick={onClose}
                        className="bg-transparent border-none cursor-pointer text-white text-2xl p-0 flex items-center"
                    >
                        <IoClose />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col p-3! gap-2!">
                    <div className="mb-5">
                        <label className="block text-base text-gray-400 mb-1">Event ID</label>
                        <div className="text-white font-mono text-m">#{e.id}</div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-base text-gray-400 mb-1">Source</label>
                        <div className="text-white text-m font-semibold">{e.source}</div>
                    </div>



                    {/* Description */}
                    <div className="mb-5">
                        <label className="block text-base text-gray-400 mb-1">Description</label>
                        <div className="text-white text-m leading-relaxed">{e.description}</div>
                    </div>

                    {/* Source */}
                    <div className="mb-5">
                        <label className="block text-base text-gray-400 mb-1">Time</label>
                        <div className="text-white text-m">{new Date(e.time).toLocaleString("en-GB")}</div>
                    </div>

                    {/* Raw message */}
                    <div className="mb-5">
                        <label className="block text-base text-gray-400 mb-1">Raw message</label>
                        <div className="text-white text-m">{rawMsg}</div>
                    </div>

                    {/* IP address */}
                    {e.ipAddress &&
                        <div className="mb-5">
                            <label className="block text-base text-gray-400 mb-1">IP address</label>
                            <div className="text-white text-m">{e.ipAddress}</div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
