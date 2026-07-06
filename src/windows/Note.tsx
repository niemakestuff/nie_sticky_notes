import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";
import {
    AddRegular,
    DismissRegular,
    MoreHorizontalRegular,
} from "@fluentui/react-icons";
import { Note } from "../types";
import useWindowFocus from "../hooks/useWindowFocus";
import HoverDarken from "../components/HoverDarken";

export default function NoteWindow({ note }: { note: Note }) {
    const isFocused = useWindowFocus();
    const titleBarClassName =
        "flex justify-between transition-[height] duration-100 ease-out p-0" +
        " " +
        (isFocused ? "h-8" : "h-2") +
        " " +
        (note.isColorDark ? "text-[#c7c7c7]" : "text-[#3e3e3e]");

    return (
        <div className="bg-mid-dark h-full">
            <div
                data-tauri-drag-region
                style={{ backgroundColor: note.color }}
                className={titleBarClassName}
            >
                {isFocused && (
                    <>
                        <HoverDarken>
                            <button
                                className="w-8 h-full flex items-center justify-center"
                                onClick={async () => {
                                    const id = crypto.randomUUID();
                                    const res = await ResultAsync.fromThrowable(
                                        invoke,
                                    )("spawn_note_window", { noteId: id });

                                    if (res.isErr()) alert(res.error);
                                }}
                            >
                                <AddRegular fontSize={20} />
                            </button>
                        </HoverDarken>

                        <div className="flex">
                            <HoverDarken>
                                <button className="w-8 h-full flex items-center justify-center">
                                    <MoreHorizontalRegular fontSize={20} />
                                </button>
                            </HoverDarken>

                            <HoverDarken>
                                <button
                                    className="w-8 h-full flex items-center justify-center"
                                    onClick={() => getCurrentWindow().close()}
                                >
                                    <DismissRegular fontSize={20} />
                                </button>
                            </HoverDarken>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
