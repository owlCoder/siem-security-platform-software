import { IoIosMenu } from "react-icons/io";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { BsCalendarFill } from "react-icons/bs";
import { VscGraph } from "react-icons/vsc";
import { LuLayers3 } from "react-icons/lu";
import { MdKeyboardArrowRight } from "react-icons/md";
import { BiError } from "react-icons/bi";
import { useState } from "react";
import { TbSquareLetterS } from "react-icons/tb";
import { TbSquareLetterI } from "react-icons/tb";
import { TbSquareLetterE } from "react-icons/tb";
import { TbSquareLetterM } from "react-icons/tb";
import { SidebarProps } from "../../types/props/dashboard/SiedbarProps";


export default function Sidebar({ setSideMenuPage }: SidebarProps) {
    const [isSidebarOpened, setIsSidebarOpened] = useState(false);
    const [hover, setHover] = useState<number | null>(null);
    const [selectedButton, setSelectedButton] = useState<number | null>(null);

    const itemClass = (index: number) =>
        `flex items-center justify-between text-sm text-white cursor-pointer transition-colors p-2
   ${hover === index || selectedButton === index ? "bg-gray-400" : "bg-[#202020]"}
  `;

    return (
        <div
            className={`h-full bg-[#202020] text-white transition-all duration-300 left-2 ${isSidebarOpened ? "w-[200px]" : "w-[45px]"}
        `}>
            <div className="flex items-center">
                <button onClick={() => setIsSidebarOpened(!isSidebarOpened)}>
                    <IoIosMenu size={30} style={{ marginLeft: '-2px' }} />
                </button>

                <TbSquareLetterS size={25} />
                <TbSquareLetterI size={25} />
                <TbSquareLetterE size={25} />
                <TbSquareLetterM size={25} />
            </div>

            {isSidebarOpened && (
                <div className="flex flex-col gap-3">
                    <button
                        className={itemClass(0)} style={{ marginLeft: '20px', borderRadius: '0.75rem' }}
                        onClick={() => {
                            setSideMenuPage(0);
                            setSelectedButton(0);
                        }}
                        onMouseEnter={() => setHover(0)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <TbLayoutDashboardFilled size={20} />
                        Dashboard
                        <MdKeyboardArrowRight size={20} />
                    </button>

                    <button
                        className={itemClass(1)} style={{ marginLeft: '20px', borderRadius: '0.75rem' }}
                        onClick={() => {
                            setSideMenuPage(1);
                            setSelectedButton(1);
                        }}
                        onMouseEnter={() => setHover(1)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <BsCalendarFill size={20} />
                        Events
                        <MdKeyboardArrowRight size={20} />
                    </button>

                    <button
                        className={itemClass(2)} style={{ marginLeft: '20px', borderRadius: '0.75rem' }}
                        onClick={() => {
                            setSideMenuPage(2);
                            setSelectedButton(2);
                        }}
                        onMouseEnter={() => setHover(2)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <VscGraph size={20} />
                        Statistics
                        <MdKeyboardArrowRight size={20} />
                    </button>

                    <button
                        className={itemClass(3)} style={{ marginLeft: '20px', borderRadius: '0.75rem' }}
                        onClick={() => {
                            setSideMenuPage(3);
                            setSelectedButton(3);
                        }}
                        onMouseEnter={() => setHover(3)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <LuLayers3 size={20} />
                        Storage
                        <MdKeyboardArrowRight size={20} />
                    </button>

                    <button
                        className={itemClass(4)} style={{ marginLeft: '20px', borderRadius: '0.75rem' }}
                        onClick={() => {
                            setSideMenuPage(4);
                            setSelectedButton(4);
                        }}
                        onMouseEnter={() => setHover(4)}
                        onMouseLeave={() => setHover(null)}
                    >
                        <BiError size={23} />
                        Alerts
                        <MdKeyboardArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
