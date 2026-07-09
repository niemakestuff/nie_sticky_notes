import { SearchRegular } from "@fluentui/react-icons";
import Hover from "../Hover";

export default function SearchNotes() {
    return (
        <div className="flex px-3 pb-[11.5px] shrink-0">
            <div className="flex items-center gap-2 h-8 px-3 bg-[#404040] grow">
                <input
                    type="text"
                    placeholder="Search..."
                    className={[
                        "flex-1 bg-transparent outline-none text-sm",
                        "placeholder:text-[#b5b5b5] focus:placeholder:text-[#787878]",
                        "font-['Segoe_UI',sans-serif]",
                    ].join(" ")}
                />
            </div>

            <Hover
                whiten
                className="text-[#b5b5b5] flex w-8 items-center justify-center bg-[#404040]"
            >
                <SearchRegular fontSize={16} className="shrink-0" />
            </Hover>
        </div>
    );
}
