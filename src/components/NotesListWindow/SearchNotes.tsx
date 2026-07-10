import { useState } from "react";
import { DismissRegular, SearchRegular } from "@fluentui/react-icons";
import Hover from "../Hover";

export default function SearchNotes() {
    const [value, setValue] = useState("");
    const [focused, setFocused] = useState(false);
    const active = value.length > 0 && focused;

    return (
        <div className="flex px-3 pb-[11.5px] shrink-0">
            <div className="flex items-center gap-2 h-8 px-3 bg-[#404040] grow">
                <input
                    type="text"
                    placeholder="Search..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={[
                        "flex-1 bg-transparent outline-none text-sm",
                        active ? "text-white" : "text-[#b5b5b5]",
                        "placeholder:text-[#b5b5b5] focus:placeholder:text-[#787878]",
                        "font-['Segoe_UI',sans-serif]",
                    ].join(" ")}
                />
            </div>

            {active && (
                <Hover
                    whiten
                    className="text-white flex w-8 h-8 items-center justify-center shrink-0 cursor-pointer bg-[#404040]"
                >
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setValue("")}
                        className="flex items-center justify-center"
                    >
                        <DismissRegular fontSize={18} className="shrink-0" />
                    </button>
                </Hover>
            )}

            <Hover
                whiten
                className={[
                    active ? "text-white" : "text-[#b5b5b5]",
                    "flex w-8 items-center justify-center bg-[#404040]",
                ].join(" ")}
            >
                <SearchRegular fontSize={16} className="shrink-0" />
            </Hover>
        </div>
    );
}
