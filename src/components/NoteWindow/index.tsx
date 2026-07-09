import { useState, useEffect } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ResultAsync } from "neverthrow";
import {
    AddRegular,
    DismissRegular,
    MoreHorizontalRegular,
} from "@fluentui/react-icons";
import { Note, RawNote } from "../../types";
import useWindowFocus from "../../hooks/useWindowFocus";
import Hover from "../../components/Hover";
import TextEditor from "../../components/TextEditor";
import { HEX_TEXT_LIGHT, HEX_TEXT_DARK } from "../../constants";
import { unrawNote, isNoteEmpty } from "../../utils";
import DropdownPanel from "./DropdownPanel";

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
                            <Hover>
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
                            </Hover>

                            <div className="flex">
                                <Dialog.Root>
                                    <Hover>
                                        <Dialog.Trigger className="w-8 h-full flex items-center justify-center outline-none">
                                            <MoreHorizontalRegular
                                                fontSize={20}
                                            />
                                        </Dialog.Trigger>
                                    </Hover>

                                    <Dialog.Portal>
                                        <Dialog.Backdrop
                                            className={[
                                                "fixed inset-0 z-40 bg-mid-dark/60",
                                                "transition-opacity duration-150 ease-out",
                                                "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
                                            ].join(" ")}
                                        />

                                        <Dialog.Popup
                                            className={[
                                                "fixed inset-x-0 top-0 z-50 outline-none",
                                                "transition-transform duration-150 ease-out",
                                                "data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
                                            ].join(" ")}
                                        >
                                            <DropdownPanel
                                                note={note}
                                                setNote={setNote}
                                            />
                                        </Dialog.Popup>
                                    </Dialog.Portal>
                                </Dialog.Root>

                                <Hover>
                                    <button
                                        className="w-8 h-full flex items-center justify-center"
                                        onClick={async () => {
                                            if (note && isNoteEmpty(note)) {
                                                const res =
                                                    await ResultAsync.fromThrowable(
                                                        invoke,
                                                    )("delete_note", {
                                                        noteId: note.id,
                                                    });

                                                if (res.isErr())
                                                    alert(res.error);
                                            }

                                            getCurrentWindow().close();
                                        }}
                                    >
                                        <DismissRegular fontSize={20} />
                                    </button>
                                </Hover>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {note !== null && <TextEditor note={note} />}
        </div>
    );
}
