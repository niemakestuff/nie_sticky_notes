import { invoke } from "@tauri-apps/api/core";
import { ResultAsync } from "neverthrow";
import { DeleteRegular } from "@fluentui/react-icons";
import { Note } from "../../types";
import { toFriendlyDate } from "../../utils";
import Hover from "../Hover";
import TextEditorReadOnly from "../TextEditor/TextEditorReadOnly";
import DeleteNoteConfirmation from "../DeleteNoteConfirmation";

export default function NoteCard({ note }: { note: Note }) {
    return (
        <Hover whiten className="bg-[#333333]">
            <div
                className="rounded-xs overflow-hidden relative group"
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
                <div className="h-1" style={{ backgroundColor: note.color }} />

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

                <div className="pl-[4px] pr-[8px] pt-[20px] pb-[9px]">
                    <div className="max-h-[102px] overflow-hidden">
                        <TextEditorReadOnly
                            key={note.modifiedAt.getTime()}
                            html={note.content}
                        />
                    </div>
                </div>
            </div>
        </Hover>
    );
}
