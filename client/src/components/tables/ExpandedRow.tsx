import { useEffect, useState } from "react";
import { ExpandedProps } from "../../types/props/events/ExpandedProps";


export function ExpandedRow({ expanded, e, parserApi }: ExpandedProps) {
    //const { token } = useAuth();
    const token = "token";      // TODO: DELETE AFTER TESTING!
    const [rawMsg, setRawMsg] = useState<string>();

    useEffect(() => {
        //if (!token) return;       // TODO: DELETE COMMENT AFTER TESTING!

        const loadEventRawMessage = async () => {
            try {
                setRawMsg((await parserApi.getParserEventById(e.id, token)).text_before_parsing);
            } catch (err) {
                console.error(err);
                setRawMsg("Currently not available.");
            }
        };

        void loadEventRawMessage();
    }, [token]);

    return (
        <>
            <tr>
                <td colSpan={4} >
                    <div className={`overflow-hidden bg-[#292929] transition-[height] duration-300 ease-in-out ${expanded ? "h-[200px]" : "h-0"}`}>
                        <div className="flex! flex-col! gap-[20px]!">
                            <h4 className="text-center text-[22px]! font-[500] text-white mt-[5px]! mb-[15px]!" >Details</h4>

                            <div className="grid" >
                                <div className="flex justify-center">
                                    <span className="w-[111px] font-[600] text-[#d1d5db] p-[10px]!">Description:</span>
                                    <span className="w-[330px] bg-[#1f1f1f] border-1 border-solid border-[#4b5563] rounded-[15px]! p-[10px]! pl-[10px]! text-white mb-[20px]!">{e.description}</span>
                                </div>

                                <div className="flex justify-center">
                                    <span className="w-[111px] font-[600] text-[#d1d5db] p-[10px]!">Raw message:</span>
                                    <span className="w-[330px] bg-[#1f1f1f] border-1 border-solid border-[#4b5563] rounded-[15px]! p-[10px]! pl-[10px]! text-white ">{rawMsg}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </td>
            </tr>
        </>
    )
}