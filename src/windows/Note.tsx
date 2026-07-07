import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";
import {
    AddRegular,
    DismissRegular,
    MoreHorizontalRegular,
} from "@fluentui/react-icons";
import { Note, RawNote } from "../types";
import useWindowFocus from "../hooks/useWindowFocus";
import HoverDarken from "../components/HoverDarken";
import TextEditor from "../components/TextEditor";
import { HEX_TEXT_LIGHT, HEX_TEXT_DARK } from "../constants";
import { unrawNote } from "../utils";

export default function NoteWindow({ noteId }: { noteId: string }) {
    const [note, setNote] = useState<Note | null>(null);
    const isFocused = useWindowFocus();
    const titleBarClassName =
        "flex justify-between transition-[height] duration-100 ease-out p-0" +
        " " +
        (isFocused ? "h-8" : "h-2");

    useEffect(() => {
        ResultAsync.fromThrowable(invoke)<RawNote>("get_note", {
            noteId: noteId,
        }).then((res) => {
            res.match(
                (rawNote) => setNote(unrawNote(rawNote)),
                (error) => alert(error),
            );
        });
    }, []);

    return (
        <div className="bg-mid-dark h-full flex flex-col">
            <div className="h-10 bg-transparent">
                <div
                    data-tauri-drag-region
                    style={{
                        color:
                            note?.isColorDark === false
                                ? HEX_TEXT_DARK
                                : HEX_TEXT_LIGHT,
                        backgroundColor: note?.color || "#000000",
                    }}
                    className={titleBarClassName}
                >
                    {isFocused && (
                        <>
                            <HoverDarken>
                                <button
                                    className="w-8 h-full flex items-center justify-center"
                                    onClick={async () => {
                                        const res =
                                            await ResultAsync.fromThrowable(
                                                invoke,
                                            )("create_note");

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
                                        onClick={() =>
                                            getCurrentWindow().close()
                                        }
                                    >
                                        <DismissRegular fontSize={20} />
                                    </button>
                                </HoverDarken>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {note !== null && <TextEditor note={note} />}
        </div>
    );
}
