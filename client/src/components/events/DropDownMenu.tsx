import { useState } from "react";

interface DropDownMenuProps {
    OnSortTypeChange: (value: number) => void;
    sortName1:string;
    sortName2:string;
    sortName3:string;
}

export default function DropDownMenu({ OnSortTypeChange,sortName1,sortName2,sortName3 }: DropDownMenuProps) {
    const [open, setOpen] = useState(false);
    const [sortText, setSortText] = useState("Sort by");
    const [arrow, setArrow] = useState(false);

    const sortChange = (text: string, value: number) => {
        setSortText(text);
        setArrow(value % 2 == 0 ? false : true);
        OnSortTypeChange(value);
        setOpen(false);
    };

    return (
        <div>
            <button
                type="button"
                className="inline-flex items-center justify-between border! border-[rgba(255,255,255,0.12)]! bg-[#2d2d2d] hover:bg-[#9ca3af]! text-white rounded-[15px]! w-[200px]! h-[40px]! cursor-pointer outline-none"
                onClick={() => setOpen(!open)}>
                <span  className="inline-flex items-center gap-2">
                    {sortText}
                    {sortText !== "Sort by" && (
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            className={`transition-transform duration-300 ease-in-out will-change-transform ${arrow ? "rotate-0" : "rotate-180"}`}
                            fill="currentColor"
                        >
                            <path d="M6 8L2 8L2 6L8 0L14 6L14 8L10 8L10 16L6 16L6 8Z" />
                        </svg>
                    )}
                </span>
                <svg
                    width={16}
                    height={16}
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="m19 9-7 7-7-7"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute top-[220px]! border! border-[rgba(255,255,255,0.12)]! bg-[#2d2d2d] rounded-[15px]! w-[200px]! z-10">
                    <ul className="p-[6px]! list-none! text-[14px] font-[500] m-0">

                        <li
                           onClick={() => sortChange(sortName1, 1)}
                           className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span>{sortName1}</span>
                            <span><svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                            >
                                <path d="M6 8L2 8L2 6L8 0L14 6L14 8L10 8L10 16L6 16L6 8Z" />
                            </svg>
                            </span>
                        </li>

                        <li
                        onClick={() => sortChange(sortName1, 2)}
                            className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span>{sortName1}</span>
                            <span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#fff"
                                >
                                    <path d="M10 8L14 8V10L8 16L2 10V8H6V0L10 4.76995e-08V8Z" />
                                </svg>
                            </span>
                        </li>

                        <li
                        onClick={() => sortChange(sortName2, 3)}
                            className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span>{sortName2}</span>
                            <span><svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                            >
                                <path d="M6 8L2 8L2 6L8 0L14 6L14 8L10 8L10 16L6 16L6 8Z" />
                            </svg>
                            </span>
                        </li>

                        <li
                        onClick={() => sortChange(sortName2, 4)}
                           className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span>{sortName2}</span>
                            <span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#fff"
                                >
                                    <path d="M10 8L14 8V10L8 16L2 10V8H6V0L10 4.76995e-08V8Z" />
                                </svg>
                            </span>
                        </li>

                        <li
                        onClick={() => sortChange(sortName3, 5)}
                            className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span>{sortName3}</span>
                            <span><svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#fff"
                            >
                                <path d="M6 8L2 8L2 6L8 0L14 6L14 8L10 8L10 16L6 16L6 8Z" />
                            </svg>
                            </span>
                        </li>

                        <li
                        onClick={() => sortChange(sortName3, 6)}
                            className="flex justify-between items-center h-[40px] px-[8px]! py-[4px]! text-white cursor-pointer border-b border-[#5a5a5a] hover:bg-[#9ca3af]!">
                            <span >{sortName3}</span>
                            <span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#fff"
                                >
                                    <path d="M10 8L14 8V10L8 16L2 10V8H6V0L10 4.76995e-08V8Z" />
                                </svg>
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
