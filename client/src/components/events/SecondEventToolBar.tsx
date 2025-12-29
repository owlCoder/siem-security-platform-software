import { FiDownload } from "react-icons/fi";
import DropDownMenu from "./DropDownMenu";
import { SecondEventToolBarProps } from "../../types/props/events/SecondEventToolBarProps";

export function SecondEventToolBar({onSortType}:SecondEventToolBarProps) {

    return (
        <>
            <div className="flex justify-end items-center mt-4! me-[10px]!">

                <div className="flex gap-[16px] items-center">


                    <DropDownMenu OnSortTypeChange={(value: number) => onSortType(value)} sortName1="Source" sortName2="Date and Time" sortName3="Type" />

                    <button className="bg-[#007a55] text-white w-[200px] h-[40px] rounded-[10px]! font-semibold flex items-center justify-center gap-2 hover:bg-[#9ca3af]">
                        Download report <FiDownload size={20} />
                    </button>
                </div>
            </div>
        </>
    )
}