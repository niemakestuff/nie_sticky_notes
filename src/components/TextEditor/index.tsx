import { invoke } from "@tauri-apps/api/core";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent, UseEditorOptions } from "@tiptap/react";
import { ResultAsync } from "neverthrow";
import { Note } from "../../types";
import { HEX_TEXT_LIGHT } from "../../constants";
import useWindowFocus from "../../hooks/useWindowFocus";
import BottomButtons from "./BottomButtons";

export function initUseEditor(content: string, options?: UseEditorOptions) {
    return useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: "Take a note…",
                showOnlyWhenEditable: false,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: [
                    "min-h-full",
                    "pl-3 pr-1 pt-0 pb-2",
                    "font-['Segoe_UI',sans-serif] text-[14px] leading-[17.5px]",
                    "outline-none caret-current",
                    "[&_p]:m-0",
                    "[&_p+p]:mt-0.5",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:m-0",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:m-0",
                    "[&_li+li]:mt-px",
                    "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
                    "[&_p.is-editor-empty:first-child::before]:text-[#b3b3b3]",
                    "[&_p.is-editor-empty:first-child::before]:float-left",
                    "[&_p.is-editor-empty:first-child::before]:h-0",
                    "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
                ].join(" "),
            },
        },
        ...options,
    });
}

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
                    !isFocused &&
                        "[&_p.is-editor-empty:first-child::before]:!content-none",
                ]
                    .filter(Boolean)
                    .join(" ")}
            />

            {isFocused && editor && <BottomButtons editor={editor} />}
        </div>
    );
}
