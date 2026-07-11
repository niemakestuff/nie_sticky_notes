import { Dispatch, SetStateAction } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
    AddRegular,
    DismissRegular,
    MoreHorizontalRegular,
    PinFilled,
    PinRegular,
} from "@fluentui/react-icons";
import { Note } from "../../types";
import useWindowFocus from "../../hooks/useWindowFocus";
import Hover from "../../components/Hover";
import { HEX_TEXT_LIGHT, HEX_TEXT_DARK } from "../../constants";
import { invoke } from "@tauri-apps/api/core";
import { isNoteEmpty, tryAsync, tryAsyncOrAlert } from "../../utils";
import DropdownPanel from "./DropdownPanel";

export default function TopBar({
    note,
    setNote,
}: {
    note: Note | null;
    setNote: Dispatch<SetStateAction<Note | null>>;
}) {
    const isFocused = useWindowFocus();

    return (
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
                className={
                    "flex justify-between transition-[height] duration-100 ease-out p-0" +
                    " " +
                    (isFocused ? "h-8" : "h-2")
                }
            >
                {isFocused && (
                    <>
                        <Hover whiten={note?.isColorDark}>
                            <button
                                className="w-8 h-full flex items-center justify-center"
                                onClick={() =>
                                    tryAsyncOrAlert(() =>
                                        invoke("create_note"),
                                    )
                                }
                            >
                                <AddRegular fontSize={20} />
                            </button>
                        </Hover>

                        <div className="flex">
                            <Dialog.Root>
                                <Hover whiten={note?.isColorDark}>
                                    <Dialog.Trigger className="w-8 h-full flex items-center justify-center outline-none">
                                        <MoreHorizontalRegular fontSize={20} />
                                    </Dialog.Trigger>
                                </Hover>

                                <Dialog.Portal>
                                    <Dialog.Backdrop
                                        className={[
                                            "fixed inset-0 z-40 bg-[#333333]/60",
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

                            <Hover whiten={note?.isColorDark}>
                                <button
                                    className="w-8 h-full flex items-center justify-center"
                                    onClick={async () => {
                                        if (note === null) return;

                                        const pinned = !note.isPinned;
                                        const winRes = await tryAsync(() =>
                                            getCurrentWindow().setAlwaysOnTop(
                                                pinned,
                                            ),
                                        );
                                        if (winRes.isErr()) {
                                            alert(winRes.error);
                                            return;
                                        }

                                        note.isPinned = pinned;
                                        setNote({ ...note });

                                        const res = await tryAsync(() =>
                                            invoke("update_note", {
                                                note: note,
                                            }),
                                        );

                                        // Roll back so the UI and window
                                        // don't disagree with the DB
                                        if (res.isErr()) {
                                            alert(res.error);
                                            note.isPinned = !pinned;
                                            setNote({ ...note });
                                            tryAsync(() =>
                                                getCurrentWindow().setAlwaysOnTop(
                                                    !pinned,
                                                ),
                                            );
                                        }
                                    }}
                                >
                                    {note?.isPinned ? (
                                        <PinFilled fontSize={18} />
                                    ) : (
                                        <PinRegular fontSize={18} />
                                    )}
                                </button>
                            </Hover>

                            <Hover whiten={note?.isColorDark}>
                                <button
                                    className="w-8 h-full flex items-center justify-center"
                                    onClick={async () => {
                                        if (note) {
                                            const cmd = isNoteEmpty(note)
                                                ? "delete_note"
                                                : "close_note";
                                            const res = await tryAsync(() =>
                                                invoke(cmd, {
                                                    noteId: note.id,
                                                }),
                                            );

                                            // Keep the window if the note
                                            // couldn't be deleted or marked
                                            // closed, or it would respawn
                                            // on the next launch
                                            if (res.isErr()) {
                                                alert(res.error);
                                                return;
                                            }
                                        }

                                        tryAsyncOrAlert(() =>
                                            getCurrentWindow().close(),
                                        );
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
    );
}
