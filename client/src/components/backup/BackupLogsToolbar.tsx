import { BackupLogsToolbarProps } from "../../types/props/backup/BackupLogsToolbarProps";
import DropDownMenu from "../events/DropDownMenu";


export default function BackupLogsToolbar({ onSort, onReset }: BackupLogsToolbarProps) {

    return(        
        <div className="grid grid-cols-3 lg:grid-cols-2 w-full px-2! py-2! mb-6">
            <div className="col-span-2 lg:col-span-1 flex justify-end">
                <div className="flex gap-3 w-full lg:w-auto">
                    <DropDownMenu
                        OnSortTypeChange={(value: number) => onSort(value)}
                        sortName1="Time"
                        sortName2="Status"
                        sortName3=""/>
                </div>
            </div>

            <div className="col-span-1 flex justify-end">
                <button 
                    onClick={onReset}
                    className="w-[90px]! py-2! rounded-[10px]! bg-[#313338]! hover:bg-[#9ca3af]! text-white text-[13px] font-semibold">
                        Reset
                    </button>
            </div>
        </div>
    );
}