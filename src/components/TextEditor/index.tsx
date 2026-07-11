import { useCallback, useState, type CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Underline from "@tiptap/extension-underline";
import { useEditor, EditorContent, UseEditorOptions } from "@tiptap/react";
import { ResultAsync } from "neverthrow";
import { Note } from "../../types";
import { HEX_TEXT_LIGHT } from "../../constants";
import useWindowFocus from "../../hooks/useWindowFocus";
import OverlayScrollbar from "../OverlayScrollbar";
import BottomButtons from "./BottomButtons";

export function initUseEditor(
    content: string,
    options?: UseEditorOptions,

    // Card previews (TextEditorReadOnly) rely on this exact default. Do NOT change.
    // I repeat, DO NOT change!!
    typography: string = "font-['Segoe_UI',sans-serif] text-[14px] leading-[19px]",
) {
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
            // Fix for pasting issue
            transformPastedHTML: (html) => html.replace(/\r?\n/g, ""),
            attributes: {
                class: [
                    typography,
                    "outline-none caret-current min-h-full",
                    "[&_p]:m-0",
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
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    // The scroll container is EditorContent's root div, grabbed via the
    // wrapper since EditorContent doesn't take a ref
    const wrapperRef = useCallback((el: HTMLDivElement | null) => {
        setScrollEl((el?.firstElementChild as HTMLElement) ?? null);
    }, []);

    const editor = initUseEditor(
        note.content,
        {
            autofocus: "end",
            onUpdate: async ({ editor }) => {
                note.content = editor.getHTML();
                note.modifiedAt = new Date();

                const res = await ResultAsync.fromThrowable(invoke)(
                    "update_note",
                    {
                        note: note,
                    },
                );

                if (res.isErr()) alert(res.error);
            },
        },
        "font-['Segoe_UI',sans-serif] text-[14px] leading-[18.4px]",
    );

    return (
        <div
            className="flex flex-col flex-1 min-h-0"
            style={{ color: HEX_TEXT_LIGHT }}
        >
            <div
                ref={wrapperRef}
                className="relative flex flex-col flex-1 min-h-0 pt-[2px] pb-[10px]"
            >
                <EditorContent
                    editor={editor}
                    style={{ "--selection-color": note.color } as CSSProperties}
                    className={[
                        "text-[#eeeeee] px-3",
                        "flex-1 min-h-0 overflow-y-auto no-native-scrollbar",
                        "selection:bg-[var(--selection-color)]",
                        "[&_*::selection]:bg-[var(--selection-color)]",
                        !isFocused &&
                            "[&_p.is-editor-empty:first-child::before]:!content-none",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                />

                <OverlayScrollbar scrollEl={scrollEl} />
            </div>

            {isFocused && editor && <BottomButtons editor={editor} />}
        </div>
    );
}
