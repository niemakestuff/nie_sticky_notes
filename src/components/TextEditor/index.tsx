import { invoke } from "@tauri-apps/api/core";
import { EditorContent } from "@tiptap/react";
import { ResultAsync } from "neverthrow";
import { Note } from "../../types";
import { HEX_TEXT_LIGHT } from "../../constants";
import useWindowFocus from "../../hooks/useWindowFocus";
import BottomButtons from "./BottomButtons";
import { initUseEditor } from ".";

export default function TextEditor({ note }: { note: Note }) {
    const isFocused = useWindowFocus();
    const editor = initUseEditor(note.content, {
        onUpdate: async ({ editor }) => {
            note.content = editor.getHTML();
            note.modifiedAt = new Date();

            const res = await ResultAsync.fromThrowable(invoke)("update_note", {
                note: note,
            });

            if (res.isErr()) alert(res.error);
        },
    });

    return (
        <div
            className="flex flex-col flex-1 min-h-0"
            style={{ color: HEX_TEXT_LIGHT }}
        >
            <EditorContent
                editor={editor}
                className={[
                    "text-[#eeeeee]",
                    "flex-1 min-h-0 overflow-y-auto",
                    "[&::-webkit-scrollbar]:w-2.5",
                    "[&::-webkit-scrollbar-track]:bg-transparent",
                    "[&::-webkit-scrollbar-thumb]:bg-white/40",
                    "[&::-webkit-scrollbar-thumb]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:border-4",
                    "[&::-webkit-scrollbar-thumb]:border-transparent",
                    "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
                    "[&::-webkit-scrollbar-thumb:hover]:bg-white/70",
                ].join(" ")}
            />

            {isFocused && editor && <BottomButtons editor={editor} />}
        </div>
    );
}
