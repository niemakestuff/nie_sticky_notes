import { invoke } from "@tauri-apps/api/core";
import { ResultAsync } from "neverthrow";
import { motion } from "motion/react";
import { DeleteRegular } from "@fluentui/react-icons";
import { Note } from "../../types";
import { toFriendlyDate } from "../../utils";
import Hover from "../Hover";
import TextEditorReadOnly from "../TextEditor/TextEditorReadOnly";
import DeleteNoteConfirmation from "../DeleteNoteConfirmation";

export default function NoteCard({ note }: { note: Note }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: 0.5, duration: 0.3 },
            }}
            exit={{
                opacity: 0,
                scale: 0.96,
                transition: { duration: 0.15 },
            }}
            transition={{
                layout: { type: "spring", stiffness: 500, damping: 40 },
            }}
        >
            <Hover whiten className="bg-[#333333] rounded-xs overflow-hidden">
                <div
                    className="relative group"
                    onClick={async () => {
                        let res = await ResultAsync.fromThrowable(invoke)(
                            "open_note",
                            {
                                noteId: note.id,
                            },
                        );

                        if (res.isErr()) alert(res.error);
                    }}
                >
                    <div
                        className="h-[3.5px]"
                        style={{ backgroundColor: note.color }}
                    />

                    <div className="text-[10px] absolute top-[9px] right-2">
                        <span
                            className="group-hover:hidden"
                            style={{ color: note.color }}
                        >
                            {toFriendlyDate(note.modifiedAt)}
                        </span>

                        <DeleteNoteConfirmation note={note}>
                            <div className="hidden group-hover:block text-[#8c8c8c] hover:text-white absolute top-[1px] right-[-2px]">
                                <DeleteRegular fontSize={15} />
                            </div>
                        </DeleteNoteConfirmation>
                    </div>

                    <div className="pl-4 pr-3 pt-[20px] pb-[17px]">
                        <div className="max-h-[92px] overflow-hidden">
                            <TextEditorReadOnly html={note.content} />
                        </div>
                    </div>

                    {note.isOpen && (
                        <div>
                            <div
                                className="absolute bottom-0 right-0 w-[14px] h-[14px]"
                                style={{
                                    background:
                                        "linear-gradient(135deg, transparent 50%, #202020 50%)",
                                }}
                            />

                            {/* folded-over flap */}
                            <div
                                className="absolute bottom-0 right-0 w-[14px] h-[14px]"
                                style={{
                                    background: "#5c5c5c",
                                    clipPath: "polygon(0 0, 100% 0, 0 100%)",
                                }}
                            />
                        </div>
                    )}
                </div>
            </Hover>
        </motion.div>
    );
}
