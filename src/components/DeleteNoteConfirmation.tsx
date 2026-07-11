import { useState } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Note } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { isNoteEmpty, tryAsync } from "../utils";
import Hover from "./Hover";

export default function DeleteNoteConfirmation({
    note,
    confirmCallback,
    children,
}: {
    note: Note;
    confirmCallback?: () => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    async function deleteNote() {
        const res = await tryAsync(() =>
            invoke("delete_note", { noteId: note.id }),
        );

        // Only run the follow-up (e.g. closing the window) if the note
        // was actually deleted
        res.match(
            () => confirmCallback?.(),
            (error) => alert(error),
        );
    }

    return (
        <AlertDialog.Root
            open={open}
            onOpenChange={(nextOpen) => {
                if (nextOpen && isNoteEmpty(note)) {
                    deleteNote(); // delete immediately, don't open
                    return;
                }

                setOpen(nextOpen);
            }}
        >
            <AlertDialog.Trigger
                onClick={(event) => event.stopPropagation()}
                className="w-full outline-none"
            >
                {children}
            </AlertDialog.Trigger>

            <AlertDialog.Portal>
                <AlertDialog.Backdrop
                    forceRender
                    className={[
                        "fixed inset-0 z-50 bg-black/65",
                        "transition-opacity duration-150",
                        "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
                    ].join(" ")}
                />

                <AlertDialog.Popup
                    onClick={(event) => event.stopPropagation()}
                    className={[
                        "fixed top-1/2 left-1/2 z-50 w-[280px] -translate-x-1/2 -translate-y-1/2",
                        "border border-white/40 bg-[#222222] shadow-2xl outline-none",
                        "text-[#e0e0e0] font-['Segoe_UI',sans-serif]",
                        "transition-all duration-150 ease-out",
                        "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
                        "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
                    ].join(" ")}
                >
                    <div className="p-5">
                        <AlertDialog.Title className="text-[15px] text-white">
                            Do you want to delete this note?
                        </AlertDialog.Title>

                        <div className="mt-5 flex justify-center gap-2.5">
                            <Hover>
                                <AlertDialog.Close
                                    className="h-[30px] min-w-[72px] bg-[#4cc2ff] px-4 text-[13px] font-semibold text-black outline-none hover:bg-[#4cc2ff]/90 focus-visible:ring-2 focus-visible:ring-white/40"
                                    onClick={() => deleteNote()}
                                >
                                    Delete
                                </AlertDialog.Close>
                            </Hover>

                            <Hover whiten>
                                <AlertDialog.Close className="h-[30px] min-w-[72px] border border-white/10 font-semibold bg-[#333333] px-4 text-[13px] text-white outline-none hover:bg-[#3d3d3d] focus-visible:ring-2 focus-visible:ring-white/40">
                                    Keep
                                </AlertDialog.Close>
                            </Hover>
                        </div>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
