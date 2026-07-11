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
import { invokeOrAlert, isNoteEmpty } from "../../utils";
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
                                onClick={() => invokeOrAlert("create_note")}
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

                            <Hover whiten={note?.isColorDark}>
                                <button
                                    className="w-8 h-full flex items-center justify-center"
                                    onClick={async () => {
                                        if (note === null) return;

                                        const pinned = !note.isPinned;
                                        await getCurrentWindow().setAlwaysOnTop(
                                            pinned,
                                        );

                                        note.isPinned = pinned;
                                        setNote({ ...note });

                                        await invokeOrAlert("update_note", {
                                            note: note,
                                        });
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
                                        if (note && isNoteEmpty(note)) {
                                            await invokeOrAlert("delete_note", {
                                                noteId: note.id,
                                            });
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
    );
}
