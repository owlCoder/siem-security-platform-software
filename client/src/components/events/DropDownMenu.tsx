import { useState } from "react";

interface DropDownMenuProps{
    OnSortTypeChange:(value:number)=>void;
}


export default function DropDownMenu({OnSortTypeChange}:DropDownMenuProps) {
    const [open, setOpen] = useState(false);
    const [sortText, setSortText] = useState("Sort by");

    const sortChange=(text:string,value:number)=>{
        setSortText(text);
        OnSortTypeChange(value);
        setOpen(false);
    }

    return (
        <div>
            <>
                <button
                    id="dropdownHoverButton"
                    data-dropdown-toggle="dropdownHover"
                    data-dropdown-trigger="hover"
                    className="inline-flex items-center justify-between rounded-xl text-black bg-[#d0d0d0] hover:bg-gray-400 border-12 border-red-100 w-44  "
                    type="button"
                    onClick={() => setOpen(!open)}
                >
                    {sortText}
                    <svg
                        className="w-4 h-4 ms-1.5 -me-0.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
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
                {/* Dropdown menu */}
                {open &&
                    <div
                    
                       
                        id="dropdownHover"
                        className="absolute top-31 z-10 bg-[#d0d0d0]  rounded-xl shadow-lg w-44"
                    >
                        <ul
                            className="p-2 text-sm text-body border-1 border-black font-medium"
                            aria-labelledby="dropdownHoverButton"
                        >
                            <li style={{ padding: "4px" }} className="inline-flex items-center  border-b border-black w-full  h-10 text-black hover:bg-gray-400 cursor-pointer" onClick={(e) => setSortText(e.currentTarget.innerText)}>

                                Sort by

                            </li>
                             <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,1)}
                            >
                                <span>Event ID</span>
                                <span>🡹</span>
                            </li>
                             <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,2)}
                            >
                                <span>Event ID</span>
                                <span>🡻</span>
                            </li>
                             <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,3)}
                            >
                                <span>Date and time</span>
                                <span>🡹</span>
                            </li>
                            <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,4)}
                            >
                                <span>Date and time</span>
                                <span>🡻</span>
                            </li>
                            <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,5)}
                            >
                                <span>Type</span>
                                <span>🡹</span>
                            </li>
                             <li
                                style={{ padding: "4px" }}
                                className="flex justify-between items-center border-b border-black w-full h-10 text-black hover:bg-gray-400 cursor-pointer"
                                onClick={(e) => sortChange(e.currentTarget.innerText,6)}
                            >
                                <span>Type</span>
                                <span>🡻</span>
                            </li>
                        </ul>
                    </div>}
            </>

        </div>
    );
}